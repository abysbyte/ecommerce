import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminGateway = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to login');
        if (data.user.role !== 'ADMIN') throw new Error('Unauthorized: Not an admin account');
        
        navigate('/admin/dashboard');
      } else {
        const res = await fetch('/api/users/admin-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, adminSecret }),
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create admin');
        
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'var(--black)' }}>
      <div className="auth-container" style={{ width: '100%', maxWidth: '400px', background: 'var(--white)', border: '4px solid var(--blue)', boxShadow: '8px 8px 0px var(--blue)' }}>
        <h2 style={{ color: 'var(--blue)', textAlign: 'center' }}>
          {mode === 'login' ? 'STAFF LOGIN' : 'NEW STAFF REGISTRATION'}
        </h2>
        {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label>FULL NAME</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>ADMIN SECURITY CODE</label>
                <input type="password" placeholder="Ask manager for secret" value={adminSecret} onChange={e => setAdminSecret(e.target.value)} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label>STAFF EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button className="btn" style={{ width: '100%', marginTop: '1rem', background: 'var(--blue)', color: 'var(--white)' }}>
            {mode === 'login' ? 'ACCESS DASHBOARD' : 'CREATE ADMIN'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Register New Staff Member' : 'Back to Login'}
        </p>
      </div>
    </div>
  );
};

export default AdminGateway;
