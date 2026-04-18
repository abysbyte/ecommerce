import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/users/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setEditForm({ name: data.name, email: data.email });
        } else {
          navigate('/login');
        }
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/users/logout', { method: 'POST', credentials: 'include' });
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
      navigate('/');
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      const res = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setUser(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <div style={{ textAlign: 'center', padding: '4rem', minHeight: '80vh' }}><h2 className="section-title">LOADING...</h2></div>;

  return (
    <div className="section-wrapper" style={{ maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <header className="section-header" style={{ borderBottom: '4px solid var(--black)', paddingBottom: '1rem', marginBottom: '3rem' }}>
        <h2 className="section-title" style={{ fontSize: '3rem' }}>MY PROFILE</h2>
        <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }}>LOG OUT</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem' }}>
        <div>
          <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--blue)', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase' }}>
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          
          {error && <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '1rem' }}>{error}</p>}
          
          {isEditing ? (
            <div style={{ marginBottom: '2rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>NAME</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '2px solid var(--black)' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>EMAIL</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '2px solid var(--black)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, padding: '0.75rem', cursor: 'pointer', background: 'var(--blue)', color: 'white', border: 'none' }}>SAVE</button>
                <button className="btn" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.75rem', cursor: 'pointer', background: 'transparent', color: 'var(--black)', border: '2px solid var(--black)' }}>CANCEL</button>
              </div>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase' }}>{user.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '2rem', textTransform: 'uppercase' }}>{user.email}</p>
              <button className="btn" onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '0.75rem', cursor: 'pointer' }}>EDIT PROFILE</button>
            </>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', textTransform: 'uppercase' }}>Recent Orders</h3>
          
          <div style={{ border: '2px solid var(--black)', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>ORDER #W-8932</span>
              <span>DELIVERED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-grey)', border: '1px solid var(--border-color)' }}></div>
              <div>
                <p style={{ fontWeight: 600 }}>Icon hoodie</p>
                <p style={{ fontSize: '0.85rem' }}>₹3499</p>
              </div>
            </div>
          </div>

          <div style={{ border: '2px solid var(--border-color)', padding: '1.5rem', opacity: 0.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
              <span>ORDER #W-4120</span>
              <span>DELIVERED</span>
            </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-grey)', border: '1px solid var(--border-color)' }}></div>
              <div>
                <p style={{ fontWeight: 600 }}>Grid Nalgene bottle</p>
                <p style={{ fontSize: '0.85rem' }}>₹999</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
