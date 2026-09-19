import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ShoppingBag, X, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Skeleton card shown while Firebase data loads ── */
const SkeletonCard = () => (
  <div style={{ animation: 'skeletonPulse 1.5s ease-in-out infinite' }}>
    <div style={{ aspectRatio: '4/5', background: '#f0efed', marginBottom: '0.75rem' }} />
    <div style={{ height: '1rem', background: '#f0efed', width: '70%', margin: '0 auto 0.4rem' }} />
    <div style={{ height: '0.875rem', background: '#f0efed', width: '40%', margin: '0 auto 0.6rem' }} />
    <div style={{ height: '0.75rem', background: '#f0efed', width: '55%', margin: '0 auto' }} />
  </div>
);

/* ── Image lightbox overlay ── */
const Lightbox = ({ item, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}
  >
    <button
      onClick={onClose}
      style={{
        position: 'absolute', top: '1rem', right: '1rem',
        color: 'white', background: 'rgba(255,255,255,0.15)',
        borderRadius: '50%', width: '36px', height: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <X size={18} />
    </button>
    <div onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
      <img
        src={item.imageUrl}
        alt={item.name}
        style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
      />
      <div style={{ color: 'white', textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem' }}>{item.name}</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>₹{item.price} · ID: {item.id}</p>
      </div>
    </div>
  </div>
);

const Home = () => {
  const {
    sections,
    activeSectionItems,
    loading,
    loadingItems,
    activeSectionId,
    setActiveSectionId
  } = useContext(StoreContext);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 500);
      setShowFloatingCTA(scrolled > 350);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleInstagramOrder = (itemId) => {
    const message = `Hi! I would like to order the item with ID: ${itemId}`;
    window.open(`https://ig.me/m/twilight.collections.in?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWhatsAppOrder = (itemId) => {
    const message = `Hi! I would like to order the item with ID: ${itemId} from Twilight Collections.`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Lightbox */}
      {lightboxItem && <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />}

      {/* Back-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: '5rem', right: '1.25rem', zIndex: 100,
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: 'var(--text-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'opacity 0.3s, transform 0.3s',
            border: 'none', cursor: 'pointer'
          }}
          title="Back to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Floating Order CTA — appears after scrolling past hero */}
      {showFloatingCTA && !lightboxItem && (
        <div className="floating-cta" style={{
          position: 'fixed', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, display: 'flex', gap: '0.5rem', alignItems: 'center',
          backgroundColor: 'white', border: '1px solid var(--border-color)',
          padding: '0.5rem 1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          borderRadius: '2rem', whiteSpace: 'nowrap'
        }}>
          <a
            href="https://ig.me/m/twilight.collections.in"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            <ShoppingBag size={13} /> Instagram
          </a>
          <span className="floating-cta-divider" style={{ color: 'var(--border-color)' }}>|</span>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#25D366', fontWeight: 500 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', width: '100%' }}>
          <h1 className="text-serif nav-brand" style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '0.04em' }}>TWILIGHT COLLECTIONS</h1>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{
        minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: '60px', paddingBottom: '2rem',
        backgroundColor: 'var(--bg-secondary)',
        backgroundImage: 'radial-gradient(circle at 50% 60%, #ffffff 0%, var(--bg-secondary) 100%)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="animate-fade-in-up" style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
            The New Collection
          </span>
          <h2 className="text-serif animate-fade-in-up delay-100" style={{ fontSize: 'clamp(1.75rem, 6vw, 3.5rem)', marginBottom: '0.75rem', fontWeight: 400, lineHeight: 1.15 }}>
            Elegance in Every <br /><i style={{ color: 'var(--accent-primary)' }}>Detail.</i>
          </h2>
          <p className="animate-fade-in-up delay-200" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
            Curated jewelry pieces designed to elevate your everyday style with timeless grace.
          </p>
          <div className="animate-fade-in-up delay-300">
            <button className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem' }} onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}>
              View Collection
            </button>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="container collection-section" style={{ padding: '2.5rem var(--spacing-lg) 3.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 className="text-serif" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Featured Pieces</h3>
          <div style={{ width: '36px', height: '1px', backgroundColor: 'var(--accent-primary)', margin: '0 auto' }} />
        </div>

        {/* Category Tabs — gap controlled by CSS media query */}
        <div className="category-tabs" style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', marginBottom: '1.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
          {loading
            ? [1, 2, 3].map(i => (
                <div key={i} style={{ height: '1.25rem', width: '60px', background: '#f0efed', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
              ))
            : sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`category-tab ${activeSectionId === section.id ? 'active' : ''}`}
                >
                  {section.name}
                </button>
              ))
          }
        </div>

        {/* Product Grid — min 150px so 2-col works on 320px phones */}
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.25rem' }}>
          {loadingItems
            ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
            : activeSectionItems.length === 0
              ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Explore our upcoming collections soon.
                </div>
              )
              : activeSectionItems.map((item, index) => (
                <div key={item.firestoreId} className="product-card animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                  {/* Image */}
                  <div
                    className="product-image-container"
                    style={{ marginBottom: '0.75rem', cursor: 'zoom-in', position: 'relative' }}
                    onClick={() => !item.soldOut && setLightboxItem(item)}
                  >
                    <div className="product-id-badge">ID: {item.id}</div>
                    {item.soldOut && (
                      <div style={{
                        position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.65)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5
                      }}>
                        <span style={{
                          background: '#1a1a1a', color: 'white', fontSize: '0.7rem',
                          textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.4rem 1rem'
                        }}>Sold Out</span>
                      </div>
                    )}
                    <img src={item.imageUrl} alt={item.name} className="product-image" />
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '0.5rem' }}>
                    <h4 className="text-serif" style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>₹{item.price}</span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.875rem', maxWidth: '240px', lineHeight: 1.5 }}>
                      {item.description}
                    </p>

                    {/* CTA Buttons */}
                    {item.soldOut ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Currently Unavailable</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleInstagramOrder(item.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid var(--text-primary)', paddingBottom: '2px', color: 'var(--text-primary)' }}
                        >
                          <ShoppingBag size={13} /> Instagram
                        </button>
                        <span style={{ color: 'var(--border-color)', fontSize: '0.8rem' }}>|</span>
                        <button
                          onClick={() => handleWhatsAppOrder(item.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid #25D366', paddingBottom: '2px', color: '#25D366' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
          }
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--bg-tertiary)', padding: '2rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 className="text-serif footer-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>TWILIGHT COLLECTIONS</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '380px', margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
            Elevating your everyday style with meticulously crafted pieces that speak to the soul.
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            © 2026 Twilight Collections. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
