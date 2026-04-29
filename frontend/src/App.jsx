import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import { Login, Signup, AdminLogin, AdminCreateUser } from './pages/Auth';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);

  // Load cart from backend on mount or when user logs in
  useEffect(() => {
    const checkUserAndLoadCart = async () => {
      try {
        const userRes = await fetch('/api/users/me', { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserId(userData.id);
          
          // Load cart from backend
          const cartRes = await fetch('/api/cart', { credentials: 'include' });
          if (cartRes.ok) {
            const cart = await cartRes.json();
            setCartItems(cart);
          }
        }
      } catch (err) {
        console.error('Error loading user/cart:', err);
      }
    };
    
    checkUserAndLoadCart();
  }, []);

  const addToCart = async (product) => {
    if (!userId) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(product)
      });

      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cart);
      } else {
        alert('Failed to add to cart');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding to cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setCartItems([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Router>
      <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />
      <Routes>
        <Route path="/" element={<Catalog onAddToCart={addToCart} />} />
        <Route path="/cart" element={<Cart items={cartItems} onRemoveFromCart={removeFromCart} onClearCart={clearCart} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        {/* Admin Routes */}
        <Route path="/admin-portal" element={<AdminLogin />} />        <Route path="/admin/create-user" element={<AdminCreateUser />} />        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
