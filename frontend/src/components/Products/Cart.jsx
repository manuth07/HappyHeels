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
      alert("CANNOT ADD MORE THAN AVAILABLE STOCK");
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
    alert('ORDER PLACED SUCCESSFULLY!');
  };

  return (
    <div className="container-fluid max-width-1200 px-4" style={{ marginTop: "100px", marginBottom: "50px" }}>
      <div className="shopping-cart">
        <div className="title">SHOPPING BAG ({cartItems.length})</div>
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="fw-bold text-uppercase mb-3">YOUR BAG IS EMPTY</h4>
            <p className="text-uppercase text-muted small">
              EXPLORE OUR COLLECTION AND ADD STYLISH FOOTWEAR TO YOUR BAG.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-items-list mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex align-items-center justify-content-between p-3 mb-3 border border-2 border-dark bg-white" style={{ boxShadow: '3px 3px 0px #000' }}>
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: "80px", height: "80px", objectFit: "cover", border: "2px solid #000" }}
                    />
                    <div>
                      <span className="text-uppercase text-muted small fw-bold d-block">{item.brand}</span>
                      <h5 className="fw-bold text-uppercase mb-0">{item.name}</h5>
                      <span className="fw-bold fs-6">LKR {item.price} EACH</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center border border-2 border-dark">
                      <button
                        className="btn btn-light btn-sm border-0 rounded-0 px-3 fw-bold"
                        onClick={() => handleDecreaseQuantity(item.id)}
                      >
                        -
                      </button>
                      <span className="px-3 fw-bold">{item.quantity}</span>
                      <button
                        className="btn btn-light btn-sm border-0 rounded-0 px-3 fw-bold"
                        onClick={() => handleIncreaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>

                    <div className="fw-bold fs-5 min-w-120 text-end">
                      LKR {item.price * item.quantity}
                    </div>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="total mb-4">
              TOTAL: LKR {totalPrice.toFixed(2)}
            </div>
            
            <Button
              className="btn btn-primary w-100 py-3 fs-5"
              onClick={handleCheckoutClick}
            >
              {user || localStorage.getItem('token') ? 'PROCEED TO CHECKOUT' : 'LOGIN TO CHECKOUT'}
            </Button>
            
            {!user && !localStorage.getItem('token') && (
              <div className="p-3 bg-light border border-dark text-center mt-3 text-uppercase fw-bold small">
                PLEASE LOGIN TO COMPLETE YOUR ORDER.
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