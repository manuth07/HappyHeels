import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axios";

const Navbar = ({ onSelectCategory, onClearCategory }) => {
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const role = storedUser ? JSON.parse(storedUser).role : null;
  const isAuthenticated = !!token;

  const handleChange = async (value) => {
    setInput(value);
    if (value.trim().length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await axios.get(`/products/search?keyword=${value}`);
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const handleCategorySelect = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login");
    window.location.reload();
  };

  const categories = ["Gents", "Ladies", "Kids", "Accessories"];

  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand me-4" to="/">
            HAPPY HEELS
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  COLLECTION
                </Link>
              </li>

              {isAuthenticated && role === "ROLE_ADMIN" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/dashboard">
                      DASHBOARD
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/add_product">
                      ADD PRODUCT
                    </Link>
                  </li>
                </>
              )}

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="/"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  CATEGORIES
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        if (onClearCategory) onClearCategory();
                      }}
                    >
                      ALL PRODUCTS
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        className="dropdown-item"
                        onClick={() => handleCategorySelect(cat)}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            {/* Search Bar */}
            <div className="search-container me-3 mb-2 mb-lg-0">
              <input
                className="form-control"
                type="search"
                placeholder="SEARCH PRODUCTS..."
                aria-label="Search"
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => input.length > 0 && setShowSearchResults(true)}
              />

              {showSearchResults && (
                <ul className="list-group search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <li key={result.id} className="list-group-item">
                        <Link
                          to={`/product/${result.id}`}
                          className="text-dark fw-bold text-decoration-none d-block"
                          onClick={() => setShowSearchResults(false)}
                        >
                          {result.name}
                        </Link>
                      </li>
                    ))
                  ) : (
                    noResults && (
                      <li className="list-group-item text-danger fw-bold">
                        NO PRODUCTS FOUND
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            {/* User Actions */}
            <div className="d-flex align-items-center gap-2">
              <Link to="/cart" className="btn btn-outline-primary btn-sm">
                BAG
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="btn btn-outline-secondary btn-sm">
                    PROFILE
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleLogout}
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-primary btn-sm">
                    LOGIN
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    REGISTER
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
