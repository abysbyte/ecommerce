import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', category: '', size: '', color: '', imageUrl: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Verify Admin Session via Cookie
  useEffect(() => {
    fetch('http://localhost:3000/api/users/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then(data => {
        if (data.role === 'ADMIN') {
          setIsAdmin(true);
          fetchProducts();
        } else {
          throw new Error('Not an admin');
        }
      })
      .catch((err) => {
        console.error(err);
        navigate('/login');
      })
      .finally(() => setAuthChecked(true));
  }, [navigate]);

  const fetchProducts = () => {
    fetch('http://localhost:3002/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await fetch('http://localhost:3002/api/products/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to upload');
      
      setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`http://localhost:3002/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      category: product.category,
      size: product.size,
      color: product.color,
      imageUrl: product.imageUrl || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `http://localhost:3002/api/products/${editingId}` : 'http://localhost:3002/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      setEditingId(null);
      setFormData({ name: '', brand: '', price: '', category: '', size: '', color: '', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
  };

  if (!authChecked) return <p style={{ padding: '2rem' }}>Verifying Identity...</p>;
  if (!isAdmin) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--blue)' }}>Admin Dashboard</h1>
        <button className="btn" onClick={() => {
            setEditingId(null);
            setFormData({ name: '', brand: '', price: '', category: '', size: '', color: '', imageUrl: '' });
        }}>+ New Product</button>
      </header>

      {/* Product Form */}
      <div style={{ background: 'var(--offwhite)', padding: '1.5rem', border: '2px solid var(--black)', marginBottom: '2rem' }}>
        <h3>{editingId ? 'Edit Product' : 'Create New Product'}</h3>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="form-group" style={{ padding: '0.5rem', border: '1px solid black' }} />
          <input type="text" placeholder="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required className="form-group" style={{ padding: '0.5rem', border: '1px solid black' }} />
          <input type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="form-group" style={{ padding: '0.5rem', border: '1px solid black' }} />
          <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required className="form-group" style={{ padding: '0.5rem', border: '1px solid black' }} />
          <input type="text" placeholder="Size" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} required className="form-group" style={{ padding: '0.5rem', border: '1px solid black' }} />
          <input type="text" placeholder="Color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required className="form-group" style={{ padding: '0.5rem', border: '1px solid black' }} />
          
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              gridColumn: '1 / -1', 
              border: isDragging ? '2px dashed var(--blue)' : '2px dashed #999', 
              padding: '2rem', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: isDragging ? 'rgba(0,0,255,0.05)' : 'white'
            }}
          >
            {uploading ? (
              <p>Uploading...</p>
            ) : formData.imageUrl ? (
              <div>
                <img src={formData.imageUrl} alt="Preview" style={{ height: '100px', objectFit: 'contain', marginBottom: '1rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Image uploaded successfully. Drag or click to replace.</p>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                <label htmlFor="file-upload" className="btn" style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Browse</label>
              </div>
            ) : (
              <div>
                <p style={{ margin: 0 }}>Drag & Drop an image here or</p>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                <label htmlFor="file-upload" className="btn" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Browse Files</label>
              </div>
            )}
          </div>
          
          <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1' }}>{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" className="btn" onClick={() => setEditingId(null)} style={{ gridColumn: '1 / -1' }}>Cancel</button>}
        </form>
      </div>

      {/* Product Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid var(--black)' }}>
        <thead>
          <tr style={{ background: 'var(--black)', color: 'var(--white)', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>ID</th>
            <th style={{ padding: '1rem' }}>Name</th>
            <th style={{ padding: '1rem' }}>Price</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--black)' }}>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{p.id}</td>
              <td style={{ padding: '1rem' }}>{p.name}</td>
              <td style={{ padding: '1rem' }}>₹{p.price}</td>
              <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn" style={{ background: 'red', color: 'white', borderColor: 'red', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>No products found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
