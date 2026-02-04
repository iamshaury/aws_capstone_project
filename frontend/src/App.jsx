import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Explore from './components/Explore';
import StockDetails from './components/StockDetails';
import AdminDashboard from './components/AdminDashboard';
import BuyStock from './components/BuyStock';
import SellStock from './components/SellStock';
import Orders from './components/Orders';
import Portfolio from './components/Portfolio';
import Layout from './components/Layout';
import Settings from './components/Settings';
import './App.css';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  const { loading } = useAuth();

  // Initial auth check loading
  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading Application...</div>;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '6rem 0 4rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-light)', padding: '0.4rem 1rem', borderRadius: '50px' }}>
                ✨ V2.0 is Live
              </span>
            </div>

            <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem', background: 'linear-gradient(to right, #1a1a1a, #555)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              The Future of <br />
              Mock Trading
            </h1>

            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem' }}>
              Experience a lightning-fast, professional-grade trading simulation without risking a dime.
              Master the market with virtual currency and real-time data styling.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '6rem' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                Start Trading Now
              </Link>
              <a href="#features" className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                Learn More
              </a>
            </div>

            {/* Feature Grid Simulation */}
            <div id="features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', textAlign: 'left' }}>
              <div className="card" style={{ background: 'var(--bg-surface)' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Real-Time Simulation</h3>
                <p style={{ color: 'var(--text-muted)' }}>Simulated price movements driven by our advanced random-walk algorithm.</p>
              </div>
              <div className="card" style={{ background: 'var(--bg-surface)' }}>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--success)' }}>Portfolio Tracking</h3>
                <p style={{ color: 'var(--text-muted)' }}>Track your P&L, holdings, and account value with professional-grade dashboards.</p>
              </div>
              <div className="card" style={{ background: 'var(--bg-surface)' }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#B388FF' }}>Instant Execution</h3>
                <p style={{ color: 'var(--text-muted)' }}>Experience zero-latency order fills. Buy and sell assets instantly.</p>
              </div>
            </div>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/explore" element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        } />
        <Route path="/stock/:symbol" element={
          <ProtectedRoute>
            <StockDetails />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/buy" element={
          <ProtectedRoute>
            <BuyStock />
          </ProtectedRoute>
        } />
        <Route path="/sell" element={
          <ProtectedRoute>
            <SellStock />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
