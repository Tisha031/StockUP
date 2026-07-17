/**
 * Profile Page
 * User profile with account details - Requires authentication
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">{getInitials(user.email)}</div>
            <h2 className="profile-email">{user.email}</h2>
            <span className="profile-badge">
              {user.is_verified ? '✓ Verified' : '⚠ Not Verified'}
            </span>
            <div className="profile-actions">
              <Link to="/settings" className="btn btn-secondary">
                Edit Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-logout">
                Logout
              </button>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-label">Email Address</div>
              <div className="stat-value">{user.email}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Account Status</div>
              <div className="stat-value">
                {user.is_verified ? 'Active' : 'Pending Verification'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Member Since</div>
              <div className="stat-value">{formatDate(user.created_at)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Last Login</div>
              <div className="stat-value">{formatDateTime(user.last_login)}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Account Information</h3>
            </div>
            <div className="card-body">
              <p>
                Your account is active and ready to use. You can manage your preferences
                in the <Link to="/settings">Settings</Link> page.
              </p>
              <p>
                For security reasons, we recommend regularly updating your password
                and reviewing your account activity.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2026 StockUP. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Profile;
