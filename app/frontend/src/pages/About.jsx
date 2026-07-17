/**
 * About Page
 * Information about StockUP platform
 */

import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

function About() {
  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="about-container">
          <div className="page-header">
            <h1 className="page-title">About StockUP</h1>
            <p className="page-description">
              Your personalized stock analysis platform
            </p>
          </div>

          <div className="about-section">
            <h2>What is StockUP?</h2>
            <p>
              StockUP is a comprehensive stock analysis platform designed to help investors
              make informed decisions about their investments. We provide real-time data,
              advanced analytics, and personalized insights to track and analyze your
              stock portfolio.
            </p>

            <h3>Our Mission</h3>
            <p>
              Our mission is to democratize stock market analysis by providing professional-grade
              tools and insights to individual investors. We believe that everyone should have
              access to the same level of analysis and information that was once available only
              to institutional investors.
            </p>

            <h3>Key Features</h3>
            <ul>
              <li>Real-time stock market data and updates</li>
              <li>Advanced portfolio tracking and analysis</li>
              <li>Personalized investment insights</li>
              <li>Custom alerts and notifications</li>
              <li>Market trends and technical analysis</li>
              <li>Historical performance tracking</li>
              <li>Risk assessment tools</li>
              <li>Investment strategy recommendations</li>
            </ul>

            <h3>Why Choose StockUP?</h3>
            <ul>
              <li><strong>Easy to Use:</strong> Intuitive interface designed for both beginners and experienced investors</li>
              <li><strong>Comprehensive Data:</strong> Access to extensive market data and analysis tools</li>
              <li><strong>Secure Platform:</strong> Bank-level security to protect your information</li>
              <li><strong>Always Updated:</strong> Real-time data ensures you have the latest information</li>
              <li><strong>Expert Support:</strong> Our team is here to help you succeed</li>
            </ul>

            <h3>Getting Started</h3>
            <p>
              Now that your account is set up, you can start exploring the platform.
              Head to your <Link to="/dashboard">Dashboard</Link> to begin analyzing stocks
              and building your portfolio. Check your <Link to="/profile">Profile</Link> for
              account details and visit <Link to="/settings">Settings</Link> to customize
              your experience.
            </p>
          </div>

          <div className="about-section">
            <h2>Contact & Support</h2>
            <p>
              Have questions or need assistance? Our support team is here to help.
            </p>
            <ul>
              <li>Email: support@stockup.com</li>
              <li>Help Center: help.stockup.com</li>
              <li>Community Forum: community.stockup.com</li>
            </ul>
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

export default About;
