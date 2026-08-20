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
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
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
              const imageUrl = URL.createObjectURL(response.data);
              return { ...item, imageUrl };
            } catch (error) {
              return { ...item, imageUrl: "" };
            }
          })
        );
        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (cart.length) {
      fetchImagesAndUpdateCart();
    } else {
      setCartItems([]);
    }
  }, [cart]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

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

  const handleCheckoutClick = () => {
    if (!user && !localStorage.getItem('token')) {
      navigate('/login?redirect=/cart');
      return;
    }
    setShowModal(true);
  };

  const handleOrderSuccess = () => {
    clearCart();
    setCartItems([]);
    setShowModal(false);
    alert('Order placed successfully!');
  };

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "68px", marginBottom: "50px" }}>
      <div className="shopping-cart">
        <div className="title">Shopping Bag ({cartItems.length})</div>
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="h2 mb-2">Your bag is empty</h4>
            <p className="subtitle">
              Explore our collection and add stylish footwear to your bag.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-items-list mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "6px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF" }}
                    />
                    <div>
                      <span className="subtitle d-block">{item.brand}</span>
                      <h5 className="fw-semibold mb-1" style={{ fontSize: "15px", color: "#111111" }}>{item.name}</h5>
                      <span className="fw-semibold" style={{ fontSize: "14px", color: "#111111" }}>LKR {item.price} each</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    {/* Quantity Pill Selector */}
                    <div className="quantity-control">
                      <button
                        onClick={() => handleDecreaseQuantity(item.id)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>

                    <div className="fw-bold min-w-120 text-end" style={{ fontSize: "16px", color: "#111111" }}>
                      LKR {item.price * item.quantity}
                    </div>

                    <button
                      className="btn btn-light btn-pill text-danger btn-sm"
                      onClick={() => handleRemoveFromCart(item.id)}
                      title="Remove item"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-banner mb-4">
              <span>Total Amount</span>
              <span>LKR {totalPrice.toFixed(2)}</span>
            </div>
            
            <Button
              className="btn btn-primary w-100 py-3 fs-6"
              onClick={handleCheckoutClick}
            >
              {user || localStorage.getItem('token') ? 'Proceed to Checkout' : 'Login to Checkout'}
            </Button>
            
            {!user && !localStorage.getItem('token') && (
              <div className="p-3 bg-light border rounded-3 text-center mt-3 subtitle">
                Please log in to complete your purchase.
              </div>
            )}
          </>
        )}
      </div>
      
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