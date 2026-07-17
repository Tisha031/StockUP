/**
 * Dashboard Page
 * Default landing page - accessible to guests and authenticated users
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="page-title">
            {isAuthenticated ? `Welcome back, ${user.name || user.email}` : 'Welcome to StockUP'}
          </h1>
          <p className="page-description">
            {isAuthenticated 
              ? 'Your complete stock analysis and portfolio management platform'
              : 'Explore our powerful stock analysis tools - Sign in to unlock full features'}
          </p>
        </div>



        {/* Tools Grid */}
        <div className="tools-grid">
          {/* Idea Lists - Always visible */}
          <div className="tool-card">
            <div className="tool-header">
              <h3>
                <span className="icon icon-lightbulb"></span>
                Idea Lists
              </h3>
              <span className="tool-badge public">Public</span>
            </div>
            <p>Browse curated stock ideas and market opportunities</p>
            <button className="btn btn-outline btn-sm">Explore Ideas</button>
          </div>

          {/* Watchlists */}
          <div className={`tool-card ${!isAuthenticated ? 'locked' : ''}`}>
            <div className="tool-header">
              <h3>
                <span className="icon icon-eye"></span>
                Watchlists
              </h3>
              {!isAuthenticated && <span className="tool-badge locked">Sign in required</span>}
            </div>
            {isAuthenticated ? (
              <>
                <p>Track and monitor your favorite stocks</p>
                <button className="btn btn-outline btn-sm">View Watchlists</button>
              </>
            ) : (
              <>
                <p className="locked-text">Sign in to create and manage your watchlists</p>
                <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Portfolios */}
          <div className={`tool-card ${!isAuthenticated ? 'locked' : ''}`}>
            <div className="tool-header">
              <h3>
                <span className="icon icon-briefcase"></span>
                Portfolios
              </h3>
              {!isAuthenticated && <span className="tool-badge locked">Sign in required</span>}
            </div>
            {isAuthenticated ? (
              <>
                <p>Manage your investment portfolios with real-time tracking</p>
                <button className="btn btn-outline btn-sm">Manage Portfolios</button>
              </>
            ) : (
              <>
                <p className="locked-text">Sign in to track your investment portfolio</p>
                <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Price Targets */}
          <div className={`tool-card ${!isAuthenticated ? 'locked' : ''}`}>
            <div className="tool-header">
              <h3>
                <span className="icon icon-target"></span>
                Price Targets
              </h3>
              {!isAuthenticated && <span className="tool-badge locked">Sign in required</span>}
            </div>
            {isAuthenticated ? (
              <>
                <p>Set target prices and get alerts when reached</p>
                <button className="btn btn-outline btn-sm">Set Targets</button>
              </>
            ) : (
              <>
                <p className="locked-text">Sign in to set price alerts and targets</p>
                <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Investment Journal */}
          <div className={`tool-card ${!isAuthenticated ? 'locked' : ''}`}>
            <div className="tool-header">
              <h3>
                <span className="icon icon-book"></span>
                Investment Journal
              </h3>
              {!isAuthenticated && <span className="tool-badge locked">Sign in required</span>}
            </div>
            {isAuthenticated ? (
              <>
                <p>Document your investment thesis and track decisions</p>
                <button className="btn btn-outline btn-sm">Open Journal</button>
              </>
            ) : (
              <>
                <p className="locked-text">Sign in to maintain your investment journal</p>
                <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* DCF Models */}
          <div className={`tool-card ${!isAuthenticated ? 'locked' : ''}`}>
            <div className="tool-header">
              <h3>
                <span className="icon icon-calculator"></span>
                DCF Models
              </h3>
              {!isAuthenticated && <span className="tool-badge locked">Sign in required</span>}
            </div>
            {isAuthenticated ? (
              <>
                <p>Build discounted cash flow valuation models</p>
                <button className="btn btn-outline btn-sm">Create Model</button>
              </>
            ) : (
              <>
                <p className="locked-text">Sign in to build DCF valuation models</p>
                <button onClick={() => navigate('/register')} className="btn btn-primary btn-sm">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="quick-stats">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Stats</h2>
              </div>
              <div className="card-body">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Watchlist Items</span>
                    <span className="stat-value">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Active Portfolios</span>
                    <span className="stat-value">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Price Alerts</span>
                    <span className="stat-value">0</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Journal Entries</span>
                    <span className="stat-value">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2026 StockUP. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Dashboard;
