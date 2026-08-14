import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axios";

const Navbar = ({ onSelectCategory, onClearCategory, onSearch }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token");
  const storedUser = localStorage.getItem('user');
  const role = storedUser ? JSON.parse(storedUser).role : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("/products");
      setSearchResults(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = async (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      try {
        const response = await axios.get(
          `/products/search?keyword=${value}`
        );
        setSearchResults(response.data);
        setNoResults(response.data.length === 0);
        console.log(response.data);
      } catch (error) {
        console.error("Error searching:", error);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

const handleCategorySelect = (category) => {
  setSelectedCategory(category);
  // Call the parent component's category selection handler
  if (onSelectCategory) {
    onSelectCategory(category);
  }
  // Close the dropdown
  setShowSearchResults(false);
};

  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/login");
    window.location.reload();
  };

  // ✅ Updated categories for shoe store
  const categories = [
    "Gents",
    "Ladies",
    "Kids",
    "Accessories",
  ];

  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg fixed-top">
          <div className="container-fluid">
            {/* ✅ Branding with shoe icon */}
            <Link className="navbar-brand" to="/">
              <i className="bi bi-bag-check-fill me-2"></i> HappyHeels
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

            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/">
                    Home
                  </Link>
                </li>

                {isAuthenticated && role === 'ROLE_ADMIN' && (
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

                {/* ✅ Categories dropdown for shoes */}
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
                          setSelectedCategory("");
                          if (onClearCategory) {
                            onClearCategory();
                          }
                        }}
                      >
                        <i className="bi bi-grid me-2"></i>
                        All Products
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          <i className="bi bi-tag me-2"></i>
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>

              {/* ✅ Theme toggle */}
              <button className="theme-btn" onClick={() => toggleTheme()}>
                {theme === "dark-theme" ? (
                  <i className="bi bi-moon-fill"></i>
                ) : (
                  <i className="bi bi-sun-fill"></i>
                )}
              </button>

              {/* Search Bar */}
              <div className="search-container me-3">
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search shoes..."
                  aria-label="Search"
                  value={input}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>

              {/* User Actions */}
              <div className="d-flex align-items-center user-actions">
                {/* Cart is visible for everyone (visitors and members) */}
                <Link to="/cart" className="nav-link text-dark me-3">
                  <i className="bi bi-cart-fill me-1"></i>
                  Cart
                </Link>

                {isAuthenticated ? (
                  <>
                    {/* User Profile Icon */}
                    <Link to="/profile" className="nav-link text-dark me-3">
                      <i className="bi bi-person-circle" style={{ fontSize: "1.5rem" }}></i>
                    </Link>
                    {/* Logout Button */}
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="nav-link text-dark me-2">
                      Login
                    </Link>
                    <Link to="/register" className="nav-link text-dark">
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Search results */}
              {showSearchResults && (
                <ul className="list-group search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <li key={result.id} className="list-group-item">
                        <Link
                          to={`/product/${result.id}`}
                          className="search-result-link"
                        >
                          <span>{result.name}</span>
                        </Link>
                      </li>
                    ))
                  ) : (
                    noResults && (
                      <p className="no-results-message">
                        No shoes found with that name
                      </p>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
