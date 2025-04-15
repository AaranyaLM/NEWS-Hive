import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../Components/Admin/AdminNavbar';
import './AdminPanel.css';
import Logo from '../../Images/Logo.png';

export default function AdminPanel() {
  const [authorized, setAuthorized] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    comments: 0,
    likesToday: 0,
    saved: 0
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Check admin authorization
    axios.get('http://localhost:5000/check-admin-session', { withCredentials: true })
      .then(res => {
        if (res.data.isAdmin) {
          setAuthorized(true);
          fetchStats();
        } else {
          setAuthorized(false);
          window.location.href = '/admin/login';
        }
      }).catch(() => {
        setAuthorized(false);
        window.location.href = '/admin/login';
      });
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      // Try to fetch each stat individually to isolate errors
      try {
        const usersRes = await axios.get('http://localhost:5000/api/admin/stats/users', 
          { withCredentials: true });
        setStats(prev => ({ ...prev, users: usersRes.data.count || 0 }));
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setErrors(prev => ({ ...prev, users: 'Failed to load user count' }));
      }
      
      try {
        const commentsRes = await axios.get('http://localhost:5000/api/admin/stats/comments', 
          { withCredentials: true });
        setStats(prev => ({ ...prev, comments: commentsRes.data.count || 0 }));
      } catch (error) {
        console.error('Error fetching comment stats:', error);
        setErrors(prev => ({ ...prev, comments: 'Failed to load comment count' }));
      }
      
      try {
        const likesRes = await axios.get('http://localhost:5000/api/admin/stats/likes-today', 
          { withCredentials: true });
        setStats(prev => ({ ...prev, likesToday: likesRes.data.count || 0 }));
      } catch (error) {
        console.error('Error fetching likes stats:', error);
        setErrors(prev => ({ ...prev, likesToday: 'Failed to load likes count' }));
      }

      try {
        const savedRes = await axios.get('http://localhost:5000/api/admin/stats/saved', 
          { withCredentials: true });
        setStats(prev => ({ ...prev, saved: savedRes.data.count || 0 }));
      } catch (error) {
        console.error('Error fetching saved articles stats:', error);
        setErrors(prev => ({ ...prev, saved: 'Failed to load saved articles count' }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <h3>Users</h3>
              <div className="stat-numbers">
                {loading ? 'Loading...' : errors.users ? 'Error' : stats.users.toLocaleString()}
              </div>
              <p>Registered users</p>
              {errors.users && <p className="error-text">{errors.users}</p>}
            </div>
            <div className="admin-stat-card">
              <h3>Comments</h3>
              <div className="stat-numbers">
                {loading ? 'Loading...' : errors.comments ? 'Error' : stats.comments.toLocaleString()}
              </div>
              <p>Total comments</p>
              {errors.comments && <p className="error-text">{errors.comments}</p>}
            </div>
            <div className="admin-stat-card">
              <h3>Likes Today</h3>
              <div className="stat-numbers">
                {loading ? 'Loading...' : errors.likesToday ? 'Error' : stats.likesToday.toLocaleString()}
              </div>
              <p>Posts liked today</p>
              {errors.likesToday && <p className="error-text">{errors.likesToday}</p>}
            </div>
            <div className="admin-stat-card">
              <h3>Saved Articles</h3>
              <div className="stat-numbers">
                {loading ? 'Loading...' : errors.saved ? 'Error' : stats.saved.toLocaleString()}
              </div>
              <p>Total saved articles</p>
              {errors.saved && <p className="error-text">{errors.saved}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}