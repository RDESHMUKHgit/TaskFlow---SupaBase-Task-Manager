import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiCheckSquare,
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiRefreshCw,
  FiZap,
  FiCheckCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signIn, signUp, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        toast.error('Please enter your full name.');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }

      setLoading(true);
      const res = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
      });
      setLoading(false);

      if (res.success) {
        toast.success('Account created successfully! 🎉 Welcome to TaskFlow.');
        navigate(from, { replace: true });
      } else {
        toast.error(res.error || 'Failed to create account.');
      }
    } else {
      setLoading(true);
      const res = await signIn({
        email: formData.email.trim(),
        password: formData.password,
      });
      setLoading(false);

      if (res.success) {
        toast.success('Signed in successfully! 👋 Welcome back.');
        navigate(from, { replace: true });
      } else {
        toast.error(res.error || 'Invalid email or password.');
      }
    }
  };

  // 1-Click Demo Login
  const handleDemoLogin = async () => {
    setFormData({
      fullName: 'Demo Engineer',
      email: 'demo@taskflow.dev',
      password: 'demopassword123',
      confirmPassword: 'demopassword123',
    });

    setLoading(true);
    // Try sign in first
    let res = await signIn({
      email: 'demo@taskflow.dev',
      password: 'demopassword123',
    });

    // If demo account doesn't exist yet, automatically create it
    if (!res.success) {
      res = await signUp({
        email: 'demo@taskflow.dev',
        password: 'demopassword123',
        fullName: 'Demo Engineer',
      });
    }

    setLoading(false);

    if (res.success) {
      toast.success('Demo account connected! 🚀');
      navigate(from, { replace: true });
    } else {
      toast.error('Demo login failed: ' + res.error);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.info('Please enter your email address above to reset password.');
      return;
    }
    const res = await resetPassword(formData.email.trim());
    if (res.success) {
      setResetSent(true);
      toast.success('Password reset link sent to your email!');
    } else {
      toast.error(res.error || 'Failed to send reset email.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side: Brand Showcase & Features */}
        <div className="auth-hero glass-card">
          <div className="auth-brand">
            <div className="brand-icon-lg">
              <FiCheckSquare />
            </div>
            <div>
              <h1 className="hero-title">TaskFlow</h1>
              <span className="hero-badge">Supabase Auth & RLS</span>
            </div>
          </div>

          <p className="hero-tagline">
            Next-generation task management with end-to-end user isolation, PostgreSQL Row-Level Security, and persistent session tokens.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">
                <FiShield />
              </div>
              <div className="feature-details">
                <h4>Row Level Security (RLS)</h4>
                <p>Every task is strictly private and scoped to your authenticated user ID.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FiRefreshCw />
              </div>
              <div className="feature-details">
                <h4>Silent Token Auto-Refresh</h4>
                <p>1-hour session lifetime with automatic silent refresh until manual logout.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FiZap />
              </div>
              <div className="feature-details">
                <h4>High-Performance CRUD</h4>
                <p>Instant analytics, filters, and priority management with PostgreSQL triggers.</p>
              </div>
            </div>
          </div>

          <div className="auth-footer-badge">
            <FiCheckCircle className="badge-check" />
            <span>PostgreSQL • Supabase Auth • Express API • React 19</span>
          </div>
        </div>

        {/* Right Side: Auth Card Form */}
        <div className="auth-card glass-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(false);
                setResetSent(false);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => {
                setIsSignUp(true);
                setResetSent(false);
              }}
            >
              Create Account
            </button>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="auth-subtitle">
              {isSignUp
                ? 'Sign up to start organizing and managing your private tasks.'
                : 'Enter your credentials to access your personal dashboard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name (Sign up only) */}
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus={!isSignUp}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Min 6 characters' : 'Enter your password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign up only) */}
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="btn-loading">
                  <FiRefreshCw className="spin" size={18} />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                <>
                  <span>{isSignUp ? 'Get Started' : 'Sign In'}</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR QUICK ACCESS</span>
          </div>

          {/* 1-Click Demo Login */}
          <button
            type="button"
            className="btn btn-demo-login"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <FiZap className="demo-icon" />
            <span>1-Click Demo Login (Instant Access)</span>
          </button>

          {/* Mode Switch Helper */}
          <div className="auth-switch">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setIsSignUp(true)}
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
