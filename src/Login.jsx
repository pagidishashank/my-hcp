import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, LogIn, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      navigate('/log-interaction');
    }, 800);
  };

  return (
    <div className="login-layout">
      {/* Left Hero Section */}
      <div className="login-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>HCP Interaction Logger</h1>
          <p>Log and track your healthcare professional interactions with AI-powered assistance. Streamline your workflow with intelligent data extraction.</p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="login-container">
        <div className="glass-panel login-card animate-fade-in">
          <div className="login-header">
            <div className="login-logo" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '1.5rem',
              color: 'white',
              fontWeight: '700'
            }}>
              HCP
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to HCP Interaction Logger</p>
          </div>

          {error && (
            <div className="error-message animate-fade-in">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="custom-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="custom-input"
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={20} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                Don't have an account? <span style={{ color: '#6366f1', fontWeight: '500' }}>Sign Up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
