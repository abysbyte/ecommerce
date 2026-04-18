import React, { useState, useEffect } from 'react';

const ProductCard = ({ product, onAdd }) => (
  <div className="product-card">
    <div className="product-image-box">
      <img src={product.imageUrl} alt={product.name} />
    </div>
    <div className="product-details">
      <div className="product-header-row">
        <span>{product.brand}</span>
        <span>₹{product.price}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="product-name">{product.name}</div>
        <button onClick={() => onAdd(product)} style={{ background: 'var(--blue)', color: 'var(--white)', border: 'none', padding: '0.25rem 0.75rem', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}>+ CART</button>
      </div>
    </div>
  </div>
);

const ProductCarousel = ({ items, onAdd }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) return null;

  if (items.length <= 3) {
    return (
      <div className="product-grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map(item => <ProductCard key={item.id} product={item} onAdd={onAdd} />)}
      </div>
    );
  }

  const nextSlide = () => {
    if (currentIndex < items.length - 3) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(items.length - 3);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={prevSlide} className="btn" style={{ position: 'absolute', left: '-1.5rem', top: '35%', zIndex: 10, padding: '0.75rem 1rem', borderRadius: '50%', background: 'var(--blue)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '4px 4px 0px var(--black)' }}>&larr;</button>
      <div style={{ overflow: 'hidden', padding: '1rem 0' }}>
        <div style={{ 
          display: 'flex', 
          transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)', 
          transform: `translateX(calc(-${currentIndex * 33.333}%))`
        }}>
          {items.map(item => (
            <div key={item.id} style={{ minWidth: '33.333%', padding: '0 0.75rem', boxSizing: 'border-box' }}>
              <ProductCard product={item} onAdd={onAdd} />
            </div>
          ))}
        </div>
      </div>
      <button onClick={nextSlide} className="btn" style={{ position: 'absolute', right: '-1.5rem', top: '35%', zIndex: 10, padding: '0.75rem 1rem', borderRadius: '50%', background: 'var(--blue)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '4px 4px 0px var(--black)' }}>&rarr;</button>
    </div>
  );
};

const Catalog = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3002/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error connecting to backend API:", err);
        setLoading(false);
      });
  }, []);

  const apparel = products.filter(p => p.category === 'Apparel');
  const accessories = products.filter(p => p.category === 'Accessories');

  return (
    <div>
      <section className="hero">
        <div className="hero-left">
          <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Sweatshirt" className="hero-image-left" style={{ mixBlendMode: 'multiply' }} />
        </div>
        <div className="hero-right">
          <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Bag" className="hero-image-right" />
        </div>
        <div className="hero-text-overlay">
          <h1>CLASSICS</h1>
        </div>
      </section>

      <section className="section-wrapper">
        <header className="section-header">
          <h2 className="section-title">Apparel</h2>
          <a href="#" className="view-all">VIEW ALL &rarr;</a>
        </header>
        {loading ? <p>Loading connection to Backend...</p> : <ProductCarousel items={apparel} onAdd={onAddToCart} />}
      </section>

      <section className="banner blue">
        <div style={{ zIndex: 10, paddingLeft: '5vw' }}>
          <h2>BUILD<br />IN STYLE</h2>
        </div>
        <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="T-Shirt View" className="floating-product" style={{ mixBlendMode: 'multiply' }} />
      </section>

      <section className="section-wrapper">
        <header className="section-header">
          <h2 className="section-title">Accessories</h2>
          <a href="#" className="view-all">VIEW ALL &rarr;</a>
        </header>
        {loading ? <p>Loading connection to Backend...</p> : <ProductCarousel items={accessories} onAdd={onAddToCart} />}
      </section>

      <section className="banner black" style={{ minHeight: '600px' }}>
        <img src="/products/banners/lowerbanner1.jpeg" alt="Tumblers" className="floating-product-secondary" style={{ left: '10%' }} />
        <div style={{ position: 'absolute', right: '5vw', textAlign: 'right', zIndex: 10 }}>
          <h2>ON<br />THE<br />GO</h2>
        </div>
      </section>
    </div>
  );
};

export default Catalog;
