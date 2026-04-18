import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const Navbar = ({ cartCount }) => {
  const navigate = useNavigate();

  const handleProfileClick = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/users/me', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/profile');
        }
      } else {
        navigate('/login');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/">SHOP ALL</Link>
        <div onClick={handleProfileClick} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} title="Profile">
          <User size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="nav-center">
        <Link to="/">Apocalypse</Link>
      </div>
      <div className="nav-right">
        <Link to="/cart">CART ({cartCount})</Link>
      </div>
    </nav>
  );
};

export default Navbar;
