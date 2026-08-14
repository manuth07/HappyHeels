import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="brutalist-footer">
      <div className="container-fluid max-width-1200 px-4">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h4 className="fw-bold text-white mb-3">HAPPY HEELS</h4>
            <p className="text-secondary small mb-3">
              Sri Lanka made high quality foot wear
            </p>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold text-white mb-3">NAVIGATION</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/">HOME COLLECTION</Link></li>
              <li><Link to="/cart">SHOPPING BAG</Link></li>
              <li><Link to="/login">ACCOUNT ACCESS</Link></li>
              <li><Link to="/register">JOIN PLATFORM</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="fw-bold text-white mb-3">CATEGORIES</h5>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/">GENTS FOOTWEAR</Link></li>
              <li><Link to="/">LADIES FOOTWEAR</Link></li>
              <li><Link to="/">KIDS COLLECTION</Link></li>
              <li><Link to="/">ESSENTIAL ACCESSORIES</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6">
            <h5 className="fw-bold text-white mb-3">CONTACT</h5>
            <p className="text-secondary small mb-1">SUPPORT@HAPPYHEELS.COM</p>
            <p className="text-secondary small mb-1">COLOMBO, SRI LANKA</p>
            <p className="text-secondary small">+94 11 234 5678</p>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} HAPPY HEELS. ALL RIGHTS RESERVED. 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
