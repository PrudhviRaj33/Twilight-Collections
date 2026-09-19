import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { Search, Plus, Trash2, LogOut, Package, Grid, Pencil, Upload, X } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { sections, items, addSection, deleteSection, updateSection, addItem, deleteItem, updateItem, loading } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState('items');

  // Protect route: redirect to /admin if not signed in via localStorage
  useEffect(() => {
    if (localStorage.getItem('twc_auth') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('twc_auth');
    navigate('/admin');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Admin Header */}
      <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-serif" style={{ fontSize: '1.25rem', margin: 0 }}>Admin Dashboard</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Twilight Collections</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="container admin-layout" style={{ display: 'flex', gap: '2rem', padding: '2rem var(--spacing-lg)', flexGrow: 1, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ width: '200px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'sticky', top: '2rem' }}>
          <button onClick={() => setActiveTab('items')} className={activeTab === 'items' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
            <Package size={16} /> Manage Items
          </button>
          <button onClick={() => setActiveTab('sections')} className={activeTab === 'sections' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
            <Grid size={16} /> Manage Sections
          </button>
          <button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', width: '100%', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
            <Search size={16} /> Search by ID
          </button>
        </aside>

        {/* Main Content */}
        <main style={{ flexGrow: 1 }}>
          {activeTab === 'items' && <ManageItems sections={sections} items={items} addItem={addItem} deleteItem={deleteItem} updateItem={updateItem} />}
          {activeTab === 'sections' && <ManageSections sections={sections} addSection={addSection} deleteSection={deleteSection} updateSection={updateSection} />}
          {activeTab === 'search' && <SearchItems items={items} />}
        </main>
      </div>
    </div>
  );
};

// --- Image Uploader Component (Firebase Storage) ---
const ImageUploader = ({ imageUrl, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    setError('');

    try {
      // 1. Compress image client-side using Canvas before uploading
      const compressed = await compressImage(file);

      // 2. Upload the compressed blob to Firebase Storage
      const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, compressed, { contentType: 'image/webp' });

      // 3. Get the public download URL and pass it back
      const downloadUrl = await getDownloadURL(snapshot.ref);
      onUploadComplete(downloadUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const compressImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const MAX = 600;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) { height *= MAX / width; width = MAX; }
          } else {
            if (height > MAX) { width *= MAX / height; height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.75);
        };
      };
    });

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && fileInputRef.current.click()}
        style={{
          border: '1px dashed var(--border-color)',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          backgroundColor: 'var(--bg-secondary)',
          transition: 'border-color 0.2s'
        }}
      >
        {imageUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={imageUrl} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left', flexGrow: 1 }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>Image uploaded ✓</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Click or drop to replace</p>
            </div>
          </div>
        ) : uploading ? (
          <div>
            <div style={{ height: '24px', width: '24px', borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--text-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }}></div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Uploading to storage...</p>
          </div>
        ) : (
          <div>
            <Upload size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Drop image here or <span style={{ borderBottom: '1px solid' }}>browse</span></p>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>JPG, PNG, WEBP supported</p>
          </div>
        )}
      </div>
      {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
};

// --- Manage Items Component ---
const ManageItems = ({ sections, items, addItem, deleteItem, updateItem }) => {
  const empty = { id: '', name: '', sectionId: '', description: '', price: '', imageUrl: '', soldOut: false };
  const [formData, setFormData] = useState(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirestoreId, setEditFirestoreId] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sectionId) { alert("Please select a section"); return; }
    if (!formData.imageUrl) { alert("Please upload an image"); return; }
    setSaving(true);
    try {
      if (isEditing) {
        await updateItem(editFirestoreId, { ...formData, price: Number(formData.price) });
        setIsEditing(false);
        setEditFirestoreId(null);
      } else {
        await addItem({ ...formData, price: Number(formData.price) });
      }
      setFormData(empty);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  const handleEdit = (item) => {
    setFormData({ id: item.id, name: item.name, sectionId: item.sectionId, description: item.description, price: item.price, imageUrl: item.imageUrl, soldOut: item.soldOut || false });
    setIsEditing(true);
    setEditFirestoreId(item.firestoreId);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFirestoreId(null);
    setFormData(empty);
  };

  return (
    <div>
      <h2 className="text-serif" ref={formRef} style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        {isEditing ? 'Edit Item' : 'Add New Item'}
      </h2>

      <form onSubmit={handleSubmit} className="admin-form" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <input className="input-field" placeholder="Item ID (e.g. TWC-104)" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} required disabled={isEditing} />
        <input className="input-field" placeholder="Item Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        <select className="input-field" value={formData.sectionId} onChange={e => setFormData({ ...formData, sectionId: e.target.value })} required style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <option value="" disabled>Select Section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="input-field" type="number" placeholder="Price (₹)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
        <textarea className="input-field" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows="3" style={{ gridColumn: '1 / -1', resize: 'vertical' }}></textarea>
        <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', userSelect: 'none' }}>
          <input type="checkbox" checked={!!formData.soldOut} onChange={e => setFormData({ ...formData, soldOut: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
          Mark as <strong>Sold Out</strong> (hides order buttons on storefront)
        </label>

        {/* Image Uploader — now uploads to Firebase Storage */}
        <ImageUploader imageUrl={formData.imageUrl} onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} />

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" style={{ flexGrow: 1 }} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Item' : <><Plus size={16} /> Add Item</>}
          </button>
          {isEditing && (
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Current Items ({items.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map(item => (
          <div key={item.firestoreId} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={item.imageUrl} alt={item.name} style={{ width: '56px', height: '56px', objectFit: 'cover' }} />
              <div>
                <p style={{ fontWeight: 500, margin: 0 }}>{item.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>({item.id})</span></p>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>₹{item.price}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(item)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Pencil size={14} /> Edit</button>
              <button onClick={() => deleteItem(item.firestoreId)} className="btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Manage Sections Component ---
const ManageSections = ({ sections, addSection, deleteSection, updateSection }) => {
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFirestoreId, setEditFirestoreId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await updateSection(editFirestoreId, name);
        setIsEditing(false);
        setEditFirestoreId(null);
      } else {
        await addSection(name);
      }
      setName('');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleEdit = (sec) => {
    setName(sec.name);
    setEditFirestoreId(sec.firestoreId);
    setIsEditing(true);
  };

  return (
    <div>
      <h2 className="text-serif" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{isEditing ? 'Edit Section' : 'Add New Section'}</h2>
      <form onSubmit={handleSubmit} className="sections-form" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input className="input-field" placeholder="Section Name (e.g. Rings)" value={name} onChange={e => setName(e.target.value)} required />
        <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }} disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Update' : <><Plus size={16} /> Add Section</>}
        </button>
        {isEditing && (
          <button type="button" className="btn-secondary" onClick={() => { setIsEditing(false); setName(''); setEditFirestoreId(null); }}>
            <X size={16} /> Cancel
          </button>
        )}
      </form>

      <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Current Sections ({sections.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sections.map(sec => (
          <div key={sec.firestoreId} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>{sec.name}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(sec)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Pencil size={14} /> Edit</button>
              <button onClick={() => deleteSection(sec.firestoreId)} className="btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Search Items Component ---
const SearchItems = ({ items }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = items.find(item => item.id.toLowerCase() === query.trim().toLowerCase());
    setResult(found || null);
    setSearched(true);
  };

  return (
    <div>
      <h2 className="text-serif" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Check Item Price by ID</h2>
      <form onSubmit={handleSearch} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input className="input-field" placeholder="Enter Item ID (e.g. TWC-101)" style={{ paddingLeft: '2.5rem' }} value={query} onChange={e => setQuery(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {searched && (
        <div className="animate-fade-in-up">
          {result ? (
            <div className="search-result" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <img src={result.imageUrl} alt={result.name} style={{ width: '140px', height: '140px', objectFit: 'cover' }} />
              <div>
                <h3 className="text-serif" style={{ fontSize: '1.5rem', margin: '0 0 0.25rem' }}>{result.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>ID: {result.id}</p>
                <div className="text-gold" style={{ fontSize: '2rem', fontWeight: 600 }}>₹{result.price}</div>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{result.description}</p>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid #ef4444', padding: '2rem', textAlign: 'center', color: '#ef4444', fontSize: '0.875rem' }}>
              No item found with ID "<strong>{query}</strong>". Please check the ID and try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
