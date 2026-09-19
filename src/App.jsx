import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Home from './pages/Home';

// Admin pages are lazy-loaded — excluded from main bundle.
// Only downloaded when user navigates to /admin.
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const AdminFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfbf9' }}>
    <div style={{ width: '32px', height: '32px', border: '2px solid #eaeaea', borderTop: '2px solid #1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={
          <Suspense fallback={<AdminFallback />}>
            <AdminLogin />
          </Suspense>
        } />
        <Route path="/admin/dashboard" element={
          <Suspense fallback={<AdminFallback />}>
            <AdminDashboard />
          </Suspense>
        } />
      </Routes>
    </Router>
  );
}

export default App;

