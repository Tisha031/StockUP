/**
 * Settings Page
 * User preferences and account settings - Requires authentication
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/settings' } });
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="settings-container">
          <div className="page-header">
            <h1 className="page-title">Settings</h1>
            <p className="page-description">
              Manage your account preferences and settings
            </p>
          </div>

          {/* Account Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">Account</h2>
            
            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Email Address</div>
                  <p className="settings-item-description">{user.email}</p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => alert('Email change coming soon!')}>
                  Change
                </button>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Password</div>
                  <p className="settings-item-description">
                    Last updated: Never
                  </p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => alert('Password change coming soon!')}>
                  Change
                </button>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Two-Factor Authentication</div>
                  <p className="settings-item-description">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => alert('2FA coming soon!')}>
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">Notifications</h2>
            
            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Email Notifications</div>
                  <p className="settings-item-description">
                    Receive updates about your account and portfolio
                  </p>
                </div>
                <button className="btn btn-sm btn-secondary">
                  Configure
                </button>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Price Alerts</div>
                  <p className="settings-item-description">
                    Get notified when stocks reach your target prices
                  </p>
                </div>
                <button className="btn btn-sm btn-secondary">
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="settings-section">
            <h2 className="settings-section-title">Privacy & Security</h2>
            
            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Activity Log</div>
                  <p className="settings-item-description">
                    View your recent account activity
                  </p>
                </div>
                <button className="btn btn-sm btn-secondary">
                  View
                </button>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Connected Devices</div>
                  <p className="settings-item-description">
                    Manage devices that have accessed your account
                  </p>
                </div>
                <button className="btn btn-sm btn-secondary">
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section">
            <h2 className="settings-section-title">Danger Zone</h2>
            
            <div className="settings-item">
              <div className="settings-item-header">
                <div>
                  <div className="settings-item-title">Delete Account</div>
                  <p className="settings-item-description">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button 
                  className="btn btn-sm" 
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      alert('Account deletion coming soon!');
                    }
                  }}
                >
                  Delete
                </button>
              </div>
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

export default Settings;
