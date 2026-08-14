import React, { useContext, useState, useEffect } from "react";
import AppContext from "../../Context/Context";
import API from "../../axios";
import CheckoutPopup from "./CheckoutPopup";
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, clearCart, user, updateCartQuantity } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartImage, setCartImage] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      console.log("Cart", cart);
      try {
        const response = await API.get("/products");
        const backendProductIds = response.data.map((product) => product.id);

        const updatedCartItems = cart.filter((item) => backendProductIds.includes(item.id));
        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            try {
              const response = await API.get(
                `/product/${item.id}/image`,
                { responseType: "blob" }
              );
              const imageFile = await converUrlToFile(response.data, response.data.imageName);
              setCartImage(imageFile)
              const imageUrl = URL.createObjectURL(response.data);
              return { ...item, imageUrl };
            } catch (error) {
              console.error("Error fetching image:", error);
              return { ...item, imageUrl: "placeholder-image-url" };
            }
          })
        );
        console.log("cart",cart)
        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (cart.length) {
      fetchImagesAndUpdateCart();
    }
  }, [cart]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const converUrlToFile = async (blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  }

  const handleIncreaseQuantity = async (itemId) => {
    const target = cartItems.find(i => i.id === itemId);
    if (!target) return;
    const nextQty = target.quantity + 1;
    if (nextQty > (target.stockQuantity || 999)) {
      alert("Cannot add more than available stock");
      return;
    }
    await updateCartQuantity(itemId, nextQty);
  };
  

  const handleDecreaseQuantity = async (itemId) => {
    const target = cartItems.find(i => i.id === itemId);
    if (!target) return;
    const nextQty = Math.max(target.quantity - 1, 1);
    await updateCartQuantity(itemId, nextQty);
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newCartItems);
  };

  // ✅ Check if user is logged in before showing checkout
  const handleCheckoutClick = () => {
    if (!user && !localStorage.getItem('token')) {
      // Save current cart and redirect to login
      navigate('/login?redirect=/cart');
      return;
    }
    setShowModal(true);
  };

  const handleOrderSuccess = () => {
    // Clear cart after successful order
    clearCart();
    setCartItems([]);
    setShowModal(false);
    
    // Optional: Show success message or redirect
    alert('Order placed successfully! You will receive a confirmation email.');
  };

  return (
    <div className="cart-container">
      <div className="shopping-cart">
        <div className="title">Shopping Bag</div>
        {cartItems.length === 0 ? (
          <div className="empty" style={{ textAlign: "left", padding: "2rem" }}>
            <h4>Your cart is empty</h4>
            {!user && (
              <p className="text-muted">
                Browse our collection and add some stylish shoes to your cart!
              </p>
            )}
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div
                  className="item"
                  style={{ display: "flex", alignContent: "center" }}
                  key={item.id}
                >
                 
                  <div>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </div>
                  <div className="description">
                    <span>{item.brand}</span>
                    <span>{item.name}</span>
                  </div>

                  <div className="quantity">
                    <button
                      className="plus-btn"
                      type="button"
                      name="button"
                      onClick={() => handleIncreaseQuantity(item.id)}
                    >
                      <i className="bi bi-plus-square-fill"></i>
                    </button>
                    <input
                      type="button"
                      name="name"
                      value={item.quantity}
                      readOnly
                    />
                    <button
                      className="minus-btn"
                      type="button"
                      name="button"
                      onClick={() => handleDecreaseQuantity(item.id)}
                    >
                      <i className="bi bi-dash-square-fill"></i>
                    </button>
                  </div>

                  <div className="total-price " style={{ textAlign: "center" }}>
                    LKR {item.price * item.quantity} {/* ✅ Changed $ to LKR */}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </div>
              </li>
            ))}
            <div className="total">Total: LKR {totalPrice}</div> {/* ✅ Changed $ to LKR */}
            
            {/* ✅ Improved checkout button with login check */}
            <Button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={handleCheckoutClick}
            >
              {user || localStorage.getItem('token') ? 'Proceed to Checkout' : 'Login to Checkout'}
            </Button>
            
            {/* ✅ Show message for non-logged-in users */}
            {!user && !localStorage.getItem('token') && (
              <div className="alert alert-info mt-2" style={{ textAlign: 'center' }}>
                <small>Please login to complete your purchase</small>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* ✅ Only show checkout popup if user is logged in */}
      {(user || localStorage.getItem('token')) && (
        <CheckoutPopup
          show={showModal}
          handleClose={() => setShowModal(false)}
          cartItems={cartItems}
          totalPrice={totalPrice}
          onOrderSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
};

export default Cart;