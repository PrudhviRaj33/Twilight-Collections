import React, { useContext, useState } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { sections, items, loading } = useContext(StoreContext);
  const [activeSection, setActiveSection] = useState(null);

  // When sections load, pick the first one
  const activeId = activeSection || (sections.length > 0 ? sections[0].id : null);
  const filteredItems = items.filter(item => item.sectionId === activeId);

  const handleInstagramOrder = (itemId) => {
    const message = `Hi! I would like to order the item with ID: ${itemId}`;
    const instagramUrl = `https://ig.me/m/twilight.collections.in?text=${encodeURIComponent(message)}`;
    window.open(instagramUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--text-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <h1 className="text-serif" style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '0.05em' }}>TWILIGHT COLLECTIONS</h1>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <Link to="/admin" style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingBottom: '3rem',
        position: 'relative',
        backgroundColor: 'var(--bg-secondary)',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, var(--bg-secondary) 100%)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <span className="animate-fade-in-up" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            The New Collection
          </span>
          <h2 className="text-serif animate-fade-in-up delay-100" style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', marginBottom: '1rem', fontWeight: 400, lineHeight: 1.1 }}>
            Elegance in Every <br /> <i style={{ color: 'var(--accent-primary)' }}>Detail.</i>
          </h2>
          <p className="animate-fade-in-up delay-200" style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: 'var(--spacing-xl)', maxWidth: '500px', margin: '0 auto var(--spacing-xl)' }}>
            Curated jewelry pieces designed to elevate your everyday style with timeless grace.
          </p>
          <div className="animate-fade-in-up delay-300">
            <button className="btn-primary" onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}>
              View Collection
            </button>
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="container" style={{ padding: '3rem var(--spacing-lg) 4rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 className="text-serif" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Featured Pieces</h3>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--accent-primary)', margin: '0 auto' }}></div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', overflowX: 'auto', marginBottom: '2rem', scrollbarWidth: 'none' }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`category-tab ${activeId === section.id ? 'active' : ''}`}
            >
              {section.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredItems.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-muted)' }}>
              Explore our upcoming collections soon.
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div key={item.firestoreId} className="product-card animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="product-image-container" style={{ marginBottom: '0.75rem' }}>
                  <div className="product-id-badge">ID: {item.id}</div>
                  <img src={item.imageUrl} alt={item.name} className="product-image" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <h4 className="text-serif" style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                  <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>₹{item.price}</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem', maxWidth: '280px', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                  <button
                    onClick={() => handleInstagramOrder(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      borderBottom: '1px solid var(--text-primary)',
                      paddingBottom: '2px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <ShoppingBag size={14} /> Order via DM
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--bg-tertiary)', padding: '2.5rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 className="text-serif" style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-md)' }}>TWILIGHT COLLECTIONS</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Elevating your everyday style with meticulously crafted pieces that speak to the soul.
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            © 2026 Twilight Collections. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
