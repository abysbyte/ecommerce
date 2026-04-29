import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      
      // Only allow regular users to login from this page
      if (data.user.role === 'ADMIN') {
        throw new Error('Admins must login from the admin portal');
      }
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container">
        <h2>LOG IN</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>EMAIL</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>SIGN IN</button>
        </form>
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
          NEW HERE? <Link to="/signup" style={{ color: 'var(--blue)' }}>CREATE ACCOUNT</Link>
        </p>
      </div>
    </div>
  );
};

export const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      
      navigate('/profile'); // Standard users go to profile
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container" style={{ boxShadow: '12px 12px 0px var(--black)', borderColor: 'var(--blue)' }}>
        <h2 style={{ color: 'var(--blue)' }}>SIGN UP</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>FULL NAME</label>
            <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>EMAIL</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <button className="btn" type="submit" style={{ width: '100%', marginTop: '1rem', background: 'var(--blue)', color: 'var(--white)', borderColor: 'var(--blue)' }}>JOIN US</button>
        </form>
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
          ALREADY A MEMBER? <Link to="/login" style={{ color: 'var(--black)' }}>LOG IN</Link>
        </p>
      </div>
    </div>
  );
};

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to login');
      
      // Only allow admins to login from this page
      if (data.user.role !== 'ADMIN') {
        // Logout the user immediately
        await fetch('/api/users/logout', {
          method: 'POST',
          credentials: 'include'
        });
        throw new Error('Only admin accounts can access this portal. Regular users must login from the user login page.');
      }
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container" style={{ boxShadow: '12px 12px 0px var(--black)', borderColor: 'var(--blue)' }}>
        <h2 style={{ color: 'var(--blue)' }}>ADMIN LOGIN</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label>EMAIL</label>
            <input type="email" placeholder="Enter admin email" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <button className="btn" type="submit" style={{ width: '100%', marginTop: '1rem', background: 'var(--blue)', color: 'var(--white)', borderColor: 'var(--blue)' }}>ADMIN LOGIN</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
          NEED TO CREATE ADMIN USER? <Link to="/admin/create-user" style={{ color: 'var(--blue)' }}>CREATE USER</Link>
        </p>
      </div>
    </div>
  );
};

export const AdminCreateUser = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, adminSecret }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      
      setSuccess('Admin user created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setAdminSecret('');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="auth-container" style={{ boxShadow: '12px 12px 0px var(--black)', borderColor: 'var(--blue)' }}>
        <h2 style={{ color: 'var(--blue)' }}>CREATE NEW ADMIN USER</h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        {success && <p style={{ color: 'green', fontWeight: 'bold' }}>{success}</p>}
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>FULL NAME</label>
            <input type="text" placeholder="Enter admin name" value={name} onChange={e => setName(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>EMAIL</label>
            <input type="email" placeholder="Enter admin email" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <div className="form-group">
            <label>ADMIN SECRET</label>
            <input type="password" placeholder="Enter admin secret code" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} style={{ borderColor: 'var(--blue)' }} required />
          </div>
          <button className="btn" type="submit" style={{ width: '100%', marginTop: '1rem', background: 'var(--blue)', color: 'var(--white)', borderColor: 'var(--blue)' }}>CREATE USER</button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
          <Link to="/admin-portal" style={{ color: 'var(--black)' }}>BACK TO LOGIN</Link>
        </p>
      </div>
    </div>
  );
};
