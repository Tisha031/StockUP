/**
 * Common Navbar Component
 * Used across all pages - adapts based on authentication state
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef(null);
  const toolsDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    console.log('Logout button clicked'); // Debug log
    logout();
    setMenuOpen(false);
    setUserDropdownOpen(false);
    navigate('/');
  };

  const toolsMenuItems = [
    {
      icon: 'chart',
      title: 'Stock Screener',
      description: 'Discover stocks',
      path: '/tools/screener'
    },
    {
      icon: 'compare',
      title: 'Stock Comparison',
      description: 'Compare stocks side-by-side',
      path: '/tools/comparison'
    },
    {
      icon: 'calculator',
      title: 'Intrinsic Value Calculator',
      description: 'Discover the true worth of stocks',
      path: '/tools/intrinsic-value'
    },
    {
      icon: 'analytics',
      title: 'DCF Calculator',
      description: 'Discounted cash flow analysis',
      path: '/tools/dcf-calculator'
    }
  ];

  const closeMenu = () => {
    setMenuOpen(false);
    setToolsDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          StockUP
        </Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="icon-menu"></span>
        </button>

        <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className="navbar-link" onClick={closeMenu}>
              Dashboard
            </Link>
          </li>
          
          {/* Tools Dropdown */}
          <li className="navbar-dropdown" ref={toolsDropdownRef}>
            <button
              className="dropdown-trigger"
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
            >
              Tools
              <span className="icon-chevron-down"></span>
            </button>
            
            <div className={`dropdown-menu ${toolsDropdownOpen ? 'open' : ''}`}>
              {toolsMenuItems.map((item, index) => (
                <button
                  key={index}
                  className="dropdown-item"
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    setMenuOpen(false);
                    alert(`${item.title} - Coming soon!`);
                  }}
                >
                  <div className="dropdown-item-title">
                    <span className={`icon icon-${item.icon}`}></span>
                    {item.title}
                  </div>
                  <p className="dropdown-item-description">{item.description}</p>
                </button>
              ))}
            </div>
          </li>

          <li>
            <Link to="/about" className="navbar-link" onClick={closeMenu}>
              About
            </Link>
          </li>

          {/* Right side - Auth or User */}
          <li className="navbar-right">
            {/* Language Selector */}
            <div className="language-selector">
              <button className="language-button">
                <span className="icon-globe"></span>
                EN 
                <span className="icon-chevron-down"></span>
              </button>
            </div>

            {isAuthenticated ? (
              <div className="navbar-user-dropdown" ref={userDropdownRef}>
                <button
                  className="user-avatar-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title="User menu"
                >
                  <div className="user-avatar">
                    {getInitials(user.email)}
                  </div>
                </button>
                
                <div className={`user-dropdown-menu ${userDropdownOpen ? 'open' : ''}`}>
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-avatar">
                      {getInitials(user.email)}
                    </div>
                    <div className="user-dropdown-info">
                      <div className="user-dropdown-name">
                        {user.email.split('@')[0]}
                      </div>
                      <div className="user-dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="user-dropdown-divider"></div>
                  
                  <button
                    className="user-dropdown-item"
                    onClick={() => {
                      navigate('/settings');
                      setUserDropdownOpen(false);
                      closeMenu();
                    }}
                  >
                    <span className="icon-settings"></span>
                    Settings
                  </button>
                  
                  <button
                    className="user-dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="icon-logout"></span>
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  onClick={() => {
                    navigate('/login');
                    closeMenu();
                  }} 
                  className="btn btn-sm btn-outline"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    navigate('/register');
                    closeMenu();
                  }} 
                  className="btn btn-sm btn-primary"
                >
                  Register
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
