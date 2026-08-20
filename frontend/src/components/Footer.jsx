import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="modern-footer">
      <div className="container-fluid max-width-1200 px-4">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Happy Heels</h4>
            <p className="subtitle mb-3">
              Premium footwear designed for high comfort, quality, and effortless daily style in Sri Lanka.
            </p>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-semibold mb-3">Navigation</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/">Catalog Collection</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/login">Account Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-semibold mb-3">Categories</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/">Gents Footwear</Link></li>
              <li><Link to="/">Ladies Footwear</Link></li>
              <li><Link to="/">Kids Collection</Link></li>
              <li><Link to="/">Accessories</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6">
            <h5 className="fw-semibold mb-3">Contact</h5>
            <p className="subtitle mb-1">support@happyheels.com</p>
            <p className="subtitle mb-1">Colombo, Sri Lanka</p>
            <p className="subtitle">+94 11 234 5678</p>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Happy Heels Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
