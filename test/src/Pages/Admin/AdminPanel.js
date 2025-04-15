import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import './AdminNavbar.css'; // We'll create this CSS file next

export default function AdminPanel() {
  const [authorized, setAuthorized] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    axios.get('http://localhost:5000/check-admin-session', { withCredentials: true })
      .then(res => {
        if (res.data.isAdmin) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          window.location.href = '/admin-login';
        }
      }).catch(() => {
        setAuthorized(false);
        window.location.href = '/admin-login';
      });
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/admin-logout', {}, { withCredentials: true });
      window.location.href = '/admin-login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  if (authorized === null) return <div className="admin-loading">Checking access...</div>;
  if (authorized === false) return <div className="admin-denied">Access Denied. Not authorized.</div>;

  return (
    <div className="admin-page-container">
      {/* Desktop Admin Sidebar */}
      <nav className="admin-sidebar desktop-only">
        <div className="admin-sidebar-container">
          <div className="admin-sidebar-logo">
            <h2>🛠️ Admin Panel</h2>
          </div>
          
          <div className="admin-sidebar-links">
            <Link to="/admin" className={`admin-sidebar-link ${isActive('/admin')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/articles" className={`admin-sidebar-link ${isActive('/admin/articles')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
              <span>Articles</span>
            </Link>
            <Link to="/admin/users" className={`admin-sidebar-link ${isActive('/admin/users')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Users</span>
            </Link>
            <Link to="/admin/settings" className={`admin-sidebar-link ${isActive('/admin/settings')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Settings</span>
            </Link>
            <Link to="/" className="admin-sidebar-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>View Website</span>
            </Link>
          </div>
          
          <div className="admin-sidebar-footer">
            <button onClick={logout} className="admin-sidebar-link logout-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Admin Navigation */}
      <nav className="admin-navbar mobile-only">
        <div className="admin-navbar-container">
          <div className="admin-navbar-logo">
            <h2>🛠️ Admin</h2>
          </div>
          
          <button 
            className="admin-mobile-menu-button" 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <svg 
              className="admin-mobile-menu-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
          
          <div className={`admin-navbar-links ${menuOpen ? 'open' : ''}`}>
            <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>
            <Link to="/admin/articles" className={isActive('/admin/articles')}>Articles</Link>
            <Link to="/admin/users" className={isActive('/admin/users')}>Users</Link>
            <Link to="/admin/settings" className={isActive('/admin/settings')}>Settings</Link>
            <Link to="/">View Website</Link>
            <button onClick={logout} className="admin-mobile-logout">Logout</button>
          </div>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <div className="admin-content">
        <div className="admin-dashboard">
          <h1>News Hive Admin Panel</h1>
          <p>Welcome, Admin! You now have access to manage the site.</p>
          {/* Dashboard content will go here */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h3>Articles</h3>
              <div className="stat-number">247</div>
              <p>Total articles published</p>
            </div>
            <div className="admin-stat-card">
              <h3>Users</h3>
              <div className="stat-number">1,358</div>
              <p>Registered users</p>
            </div>
            <div className="admin-stat-card">
              <h3>Views</h3>
              <div className="stat-number">25.4k</div>
              <p>Total page views</p>
            </div>
            <div className="admin-stat-card">
              <h3>Comments</h3>
              <div className="stat-number">842</div>
              <p>User comments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}