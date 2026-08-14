import "./App.css";
import React, { useState } from "react";
import Home from "./components/Products/Home";
import Navbar from "./components/Products/Navbar";
import Cart from "./components/Products/Cart";
import AddProduct from "./components/Products/AddProduct";
import Product from "./components/Products/Product";
import { Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "./Context/Context";
import UpdateProduct from "./components/Products/UpdateProduct";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import PrivateRoute from "./components/Auth/PrivateRoute";
import UserProfile from "./components/Auth/UserProfile";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageUsers from "./components/Admin/ManageUsers";
import ManageOrders from "./components/Admin/ManageOrders";
import Footer from "./components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const location = useLocation();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleClearCategory = () => {
    setSelectedCategory("");
  };

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  return (
    <AppProvider>
      <div id="root">
        <Navbar onSelectCategory={handleCategorySelect} onClearCategory={handleClearCategory} />
        
        <main className="main-content-wrapper">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  addToCart={addToCart} 
                  selectedCategory={selectedCategory}
                />
              } 
            />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/product/:id" element={<Product addToCart={addToCart} />} />
            
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            
            <Route path="/cart" element={<Cart />} />
            
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute requiredRole="ROLE_ADMIN">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute requiredRole="ROLE_ADMIN">
                  <ManageUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute requiredRole="ROLE_ADMIN">
                  <ManageOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/add_product"
              element={
                <PrivateRoute requiredRole="ROLE_ADMIN">
                  <AddProduct />
                </PrivateRoute>
              }
            />
            <Route
              path="/product/update/:id"
              element={
                <PrivateRoute requiredRole="ROLE_ADMIN">
                  <UpdateProduct />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;