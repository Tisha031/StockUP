/**
 * Forgot Password Page
 * Allows users to request a password reset link
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authAPI from '../services/api';
import '../styles/auth.css';

function ForgotPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.length > 0) setErrors([]);
  };

  const validateEmail = () => {
    const newErrors = [];
    if (!email) {
      newErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push('Invalid email format');
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateEmail();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await authAPI.forgotPassword(email);

    if (result.success) {
      setSuccessMessage(true);
      setEmailSent(true);
      setEmail('');
      setTimeout(() => {
        setSuccessMessage(false);
      }, 5000);
    } else {
      setErrors([result.error.message] || ['Failed to send reset email']);
    }
    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-logo">
            <h1 className="auth-logo-text">StockUP</h1>
            <p className="auth-subtitle">Check your email</p>
          </div>

          <div className="alert alert-success">
            ✓ Password reset link has been sent to your email address.
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Please check your email inbox (and spam folder) for a link to reset your password.
            </p>
            <p style={{ marginBottom: '20px', color: '#999', fontSize: '14px' }}>
              The reset link will expire in 1 hour for security.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary auth-submit"
            onClick={() => navigate('/login')}
            style={{ width: '100%' }}
          >
            Back to Login
          </button>

          <div className="auth-footer">
            <p>
              Didn't receive the email?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => setEmailSent(false)}
                disabled={loading}
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1 className="auth-logo-text">StockUP</h1>
          <p className="auth-subtitle">Forgot your password?</p>
        </div>

        <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          <p>
            Enter the email address associated with your StockUP account, and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className={`form-input ${errors.length > 0 ? 'error' : ''}`}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {errors.length > 0 && (
            <div className="alert alert-error">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              ✓ Reset link sent! Check your email.
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner"></span> Sending reset link...</>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
