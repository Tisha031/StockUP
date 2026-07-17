/**
 * Reset Password Page
 * Allows users to set a new password using the reset token
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authAPI from '../services/api';
import '../styles/auth.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    // Get email and token from URL params
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    if (!email || !token) {
      setErrors(['Invalid reset link. Please request a new password reset.']);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      email,
      token,
    }));
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors.length > 0) setErrors([]);
  };

  const validateForm = () => {
    const newErrors = [];
    
    if (!formData.new_password) {
      newErrors.push('New password is required');
    } else if (formData.new_password.length < 6) {
      newErrors.push('Password must be at least 6 characters');
    } else if (!/\d/.test(formData.new_password)) {
      newErrors.push('Password must include a number');
    } else if (!/[@$!%*#?&^_\-]/.test(formData.new_password)) {
      newErrors.push('Password must include a special character');
    }
    
    if (!formData.confirm_password) {
      newErrors.push('Confirm password is required');
    }
    
    if (formData.new_password !== formData.confirm_password) {
      newErrors.push('Passwords do not match');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.token) {
      setErrors(['Invalid reset link. Please request a new password reset.']);
      return;
    }
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await authAPI.resetPassword(
      formData.email,
      formData.token,
      formData.new_password
    );

    if (result.success) {
      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/login', { state: { email: formData.email } });
      }, 2000);
    } else {
      setErrors([result.error.message] || ['Failed to reset password']);
    }
    setLoading(false);
  };

  if (successMessage) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-logo">
            <h1 className="auth-logo-text">StockUP</h1>
            <p className="auth-subtitle">Password reset successful</p>
          </div>

          <div className="alert alert-success">
            ✓ Your password has been reset successfully!
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errors.length > 0 && !formData.email) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-logo">
            <h1 className="auth-logo-text">StockUP</h1>
            <p className="auth-subtitle">Invalid Reset Link</p>
          </div>

          <div className="alert alert-error">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary auth-submit"
            onClick={() => navigate('/forgot-password')}
            style={{ width: '100%' }}
          >
            Request New Reset Link
          </button>

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate('/login')}
              >
                Sign in
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
          <p className="auth-subtitle">Set a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="new_password">New Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className={`form-input ${errors.length > 0 ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
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
            <p className="form-helper">
              Min. 6 characters with a number and special character
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`form-input ${errors.length > 0 ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
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
              <><span className="spinner"></span> Resetting password...</>
            ) : (
              'Reset Password'
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

export default ResetPassword;
