import API from "../axios"; // axios instance with auth header
import { useState, useEffect, createContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }); // User state


  // Check for existing user on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      console.log('Token and user found on app start, validating...');
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Validate token with backend
        API.get('/auth/validate')
          .then((res) => {
            if (res.data.valid) {
              console.log('Token is valid, user authenticated');
            } else {
              throw new Error('Token invalid');
            }
          })
          .catch((error) => {
            console.log('Token validation failed:', error.message);
            // token invalid -> clear
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          });
      } catch (error) {
        console.log('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else if (token && !storedUser) {
      // Have token but no user data, try to fetch user profile
      console.log('Token found but no user data, fetching profile...');
      API.get('/auth/me')
        .then((res) => {
          if (res.data) {
            const fetchedUser = res.data;
            const normalized = {
              email: fetchedUser.email,
              name: fetchedUser.name,
              role: fetchedUser.role,
            };
            setUser(normalized);
            localStorage.setItem('user', JSON.stringify(normalized));
            console.log('User profile loaded successfully');
          }
        })
        .catch((error) => {
          console.log('Failed to fetch user profile:', error.message);
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  // Helper: normalize backend cart items to local cart shape
  const normalizeCart = (serverItems) => {
    return (serverItems || []).map(ci => ({
      id: ci.productId,
      name: ci.productName,
      brand: ci.brand,
      price: ci.unitPrice,
      quantity: ci.quantity,
      stockQuantity: ci.stockQuantity
    }));
  };

  // Load backend cart when logged in, and merge guest cart on first login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    const mergeAndLoad = async () => {
      try {
        // If there is a guest cart locally, merge it into backend
        const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (guestCart.length) {
          const items = guestCart.map(g => ({ productId: g.id, quantity: g.quantity || 1 }));
          await API.post('/cart/merge', { items });
        }
        const res = await API.get('/cart');
        const normalized = normalizeCart(res.data);
        setCart(normalized);
        localStorage.setItem('cart', JSON.stringify(normalized));
      } catch (e) {
        console.log('Failed to sync/load cart:', e?.message || e);
      }
    };

    mergeAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        await API.post('/cart/add', null, { params: { productId: product.id, quantity: 1 } });
        const res = await API.get('/cart');
        const normalized = normalizeCart(res.data);
        setCart(normalized);
        localStorage.setItem('cart', JSON.stringify(normalized));
        return;
      } catch (e) {
        console.log('Failed to add to backend cart, falling back to local:', e?.message || e);
      }
    }
    // Fallback to local cart for guests or on failure
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex !== -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        await API.delete('/cart/remove', { params: { productId } });
        const res = await API.get('/cart');
        const normalized = normalizeCart(res.data);
        setCart(normalized);
        localStorage.setItem('cart', JSON.stringify(normalized));
        return;
      } catch (e) {
        console.log('Failed to remove from backend cart, falling back to local:', e?.message || e);
      }
    }
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const refreshData = async () => {
    try {
      const response = await API.get("/products");
      setData(response.data);
    } catch (error) {
      setIsError(error.message);
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        await API.delete('/cart/clear');
      } catch (e) {
        console.log('Failed to clear backend cart:', e?.message || e);
      }
    }
    setCart([]);
    localStorage.removeItem('cart');
  };

  const updateCartQuantity = async (productId, quantity) => {
    const token = localStorage.getItem('token');
    if (token && user) {
      try {
        await API.put('/cart/set', null, { params: { productId, quantity } });
        const res = await API.get('/cart');
        const normalized = normalizeCart(res.data);
        setCart(normalized);
        localStorage.setItem('cart', JSON.stringify(normalized));
        return;
      } catch (e) {
        console.log('Failed to update backend cart quantity, falling back to local:', e?.message || e);
      }
    }
    // Local fallback for guests
    if (quantity <= 0) {
      const updated = cart.filter(i => i.id !== productId);
      setCart(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    } else {
      const exists = cart.some(i => i.id === productId);
      const updated = exists
        ? cart.map(i => i.id === productId ? { ...i, quantity } : i)
        : cart;
      setCart(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const value = {
    data,
    isError,
    cart,
    user,
    setUser,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    refreshData,
    clearCart,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;