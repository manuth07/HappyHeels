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
        <div className="container-fluid max-width-1200">
          <Link className="navbar-brand me-4" to="/">
            Happy Heels
            <span className="brand-badge">FLX</span>
          </Link>

          <button
            className="navbar-toggler border-0"
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
                  Collection
                </Link>
              </li>

              {isAuthenticated && role === "ROLE_ADMIN" && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/add_product">
                      Add Product
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
                  Categories
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        if (onClearCategory) onClearCategory();
                      }}
                    >
                      All Footwear
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

            {/* Search Bar (Styleguide Spec: Height 40px, Pill radius, hair line border, #6E6E73 icon) */}
            <div className="search-container me-3 mb-2 mb-lg-0">
              <i className="bi bi-search search-icon"></i>
              <input
                className="form-control search-input-pill"
                type="search"
                placeholder="Search products..."
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
                          className="text-dark d-block"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <span className="fw-medium">{result.name}</span>
                          <span className="text-muted ms-2 small">LKR {result.price}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    noResults && (
                      <li className="list-group-item text-muted text-center py-2">
                        No products found
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>

            {/* User Actions */}
            <div className="d-flex align-items-center gap-2">
              <Link to="/cart" className="btn btn-secondary btn-pill">
                <i className="bi bi-bag me-1"></i> Bag
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="btn btn-light btn-pill">
                    <i className="bi bi-person me-1"></i> Profile
                  </Link>
                  <button
                    className="btn btn-light btn-pill text-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-light btn-pill">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-pill">
                    Join Us
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
