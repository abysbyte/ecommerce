import React from 'react';
import { Link } from 'react-router-dom';

const Cart = ({ items }) => {
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <div className="container fade-in" style={{ padding: '8rem 2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '2rem' }}>Discover our latest arrivals and elevate your wardrobe.</p>
        <Link to="/" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '4rem 2rem', minHeight: '80vh' }}>
      <h2 style={{ marginBottom: '3rem' }}>Your Cart</h2>
      
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        <div>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '2rem', paddingBottom: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '120px', height: '160px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="product-brand">{item.brand}</span>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Size: {item.size}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Qty: {item.quantity}</span>
                  <span style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ background: '#fff', padding: '2rem', border: '1px solid var(--border)' }}>
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Shipping</span>
            <span>Complimentary</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 600, fontSize: '1.2rem' }}>
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
