import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../Components/Admin/AdminNavbar';
import './AdminPanel.css';
import Logo from '../../Images/Logo.png';


export default function AdminPanel() {
  const [authorized, setAuthorized] = useState(null);
  
  useEffect(() => {
    axios.get('http://localhost:5000/check-admin-session', { withCredentials: true })
      .then(res => {
        if (res.data.isAdmin) {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          window.location.href = '/admin/login';
        }
      }).catch(() => {
        setAuthorized(false);
        window.location.href = '/admin/login';
      });
  }, []);

  if (authorized === null) return <div className="admin-loading">Checking access...</div>;
  if (authorized === false) return <div className="admin-denied">Access Denied. Not authorized.</div>;

  return (
    <div className="admin-page-container">
      <AdminNavbar />
      
      {/* Main Content Area */}
      <div className="admin-content">
        <div className="admin-dashboard">
        <div className="admin-header">
          <div className='header-item'>
          <img src={Logo} alt="News Hive Logo" className="admin-logo" />
          </div>
          <div className='header-item'>
          <h1>Admin Dashboard</h1>
          <p>Welcome, Admin! You now have access to manage the site.</p>
          </div>

 
</div>


          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <h3>Articles</h3>
              <div className="stat-numbers">247</div>
              <p>Total articles published</p>
            </div>
            <div className="admin-stat-card">
              <h3>Users</h3>
              <div className="stat-numbers">1,358</div>
              <p>Registered users</p>
            </div>
            <div className="admin-stat-card">
              <h3>Views</h3>
              <div className="stat-numbers">25.4k</div>
              <p>Total page views</p>
            </div>
            <div className="admin-stat-card">
              <h3>Comments</h3>
              <div className="stat-numbers">842</div>
              <p>User comments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}