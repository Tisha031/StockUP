/**
 * OTP Verification Page
 * Clean black & white design
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authAPI from '../services/api';
import '../styles/auth.css';

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      inputRefs.current[3]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setLoading(true);
    const result = await authAPI.verifyOTP(email, otpCode);

    if (result.success) {
      setSuccess('Verified! Redirecting to login...');
      setTimeout(() => navigate('/login', { state: { email, verified: true } }), 2000);
    } else {
      setError(result.error.message || 'Verification failed');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    const result = await authAPI.resendOTP(email);
    if (result.success) {
      setSuccess('New code sent to your email');
      setCountdown(60);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error.message || 'Failed to resend code');
    }
    setResending(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1 className="auth-logo-text">StockUP</h1>
          <p className="auth-subtitle">Enter verification code</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`otp-input ${error ? 'error' : ''}`}
                disabled={loading || resending}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="otp-email-info">
            Code sent to <strong>{email}</strong>
          </div>

          {error && (
            <div className="alert alert-error mt-md">{error}</div>
          )}

          {success && (
            <div className="alert alert-success mt-md">{success}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading || resending || otp.join('').length !== 4}
          >
            {loading ? (
              <><span className="spinner"></span> Verifying...</>
            ) : (
              'Verify Email'
            )}
          </button>

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button
              type="button"
              className="link-btn"
              onClick={handleResend}
              disabled={loading || resending || countdown > 0}
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate('/register')}
            disabled={loading || resending}
          >
            ← Back to registration
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
