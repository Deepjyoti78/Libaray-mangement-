import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@library.delhi');
  const [password, setPassword] = useState('LibraryDemo2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already authenticated?
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@library.delhi');
    setPassword('LibraryDemo2026!');
    setError('');
  };

  return (
    <div className="sora-login-wrapper">
      <div className="sora-login-container">
        {/* Top Back Link */}
        <Link to="/" className="sora-login-back">
          <ArrowLeft size={15} />
          <span>Return to Public Site</span>
        </Link>

        {/* Main Login Card */}
        <div className="sora-login-card">
          {/* Card Header & Brand */}
          <div className="sora-login-header">
            <div className="sora-brand-badge">
              <BookOpen size={22} strokeWidth={2} className="sora-brand-icon" />
            </div>
            <div className="sora-brand-names">
              <span className="sora-brand-super">SORA LIBRARY</span>
              <h1 className="sora-login-title">Management Console</h1>
            </div>
            <p className="sora-login-subtitle">
              Sign in with your staff credentials to access catalog operations, loans, and circulation analytics.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="sora-login-form">
            {error && (
              <div className="sora-error-banner" role="alert">
                <AlertCircle size={16} className="sora-error-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="sora-input-group">
              <label htmlFor="staffEmail" className="sora-input-label">
                Staff Email Address
              </label>
              <div className="sora-input-box">
                <Mail size={16} className="sora-field-icon" />
                <input
                  id="staffEmail"
                  type="email"
                  className="sora-input-element"
                  placeholder="admin@library.delhi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="sora-input-group">
              <label htmlFor="staffPassword" className="sora-input-label">
                Password
              </label>
              <div className="sora-input-box">
                <Lock size={16} className="sora-field-icon" />
                <input
                  id="staffPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="sora-input-element"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="sora-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="sora-btn-signin"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="sora-spinner-sm" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} className="sora-btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Seed Demo Credentials Helper Box */}
          <div className="sora-demo-helper-box">
            <div className="sora-demo-header">
              <ShieldCheck size={14} className="sora-demo-shield" />
              <span className="sora-demo-tag">DEMO ADMINISTRATOR CREDENTIALS</span>
            </div>
            <div className="sora-demo-creds-preview">
              <div className="sora-cred-item">
                <span className="sora-cred-key">Email:</span>
                <code className="sora-cred-val">admin@library.delhi</code>
              </div>
              <div className="sora-cred-item">
                <span className="sora-cred-key">Pass:</span>
                <code className="sora-cred-val">LibraryDemo2026!</code>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="sora-btn-fill-demo"
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="sora-login-footer">
          <span>Sora Library System · Management Console</span>
        </div>
      </div>
    </div>
  );
}
