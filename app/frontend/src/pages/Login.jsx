/**
 * Login Page
 * Clean black & white design
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authAPI from '../services/api';
import '../styles/auth.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState(false);

  useEffect(() => {
    if (location.state?.verified) {
      setVerifiedMessage(true);
      setTimeout(() => setVerifiedMessage(false), 5000);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrors(['Please fill in all fields']);
      return;
    }

    setLoading(true);
    const result = await authAPI.login(formData.email, formData.password);

    if (result.success) {
      // Pass both user data and token to authLogin
      authLogin(result.data.user, result.data.access_token);
      navigate('/'); // Redirect to Dashboard (home)
    } else {
      setErrors([result.error.message] || ['Login failed']);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1 className="auth-logo-text">StockUP</h1>
          <p className="auth-subtitle">Welcome back</p>
        </div>

        {verifiedMessage && (
          <div className="alert alert-success">
            ✓ Email verified! You can now sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.length > 0 ? 'error' : ''}`}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.length > 0 ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          {errors.length > 0 && (
            <div className="alert alert-error">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner"></span> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/register')}
              disabled={loading}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
