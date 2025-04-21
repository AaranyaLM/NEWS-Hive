import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../Components/Admin/AdminNavbar';
import './AdminPanel.css';
import Logo from '../../Images/Logo.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminPanel() {
  const [authorized, setAuthorized] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    comments: 0,
    likesToday: 0,
    saved: 0,
    downloads: 0
  });
  const [interactionData, setInteractionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [chartView, setChartView] = useState('bar'); // 'bar' or 'pie'
  
  useEffect(() => {
    // Check admin authorization
    axios.get('http://localhost:5000/check-admin-session', { withCredentials: true })
      .then(res => {
        if (res.data.isAdmin) {
          setAuthorized(true);
          fetchStats();
          fetchInteractionData();
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
      
      try {
        const downloadsRes = await axios.get('http://localhost:5000/api/admin/stats/downloads', 
          { withCredentials: true });
        setStats(prev => ({ ...prev, downloads: downloadsRes.data.count || 0 }));
      } catch (error) {
        console.error('Error fetching downloads stats:', error);
        setErrors(prev => ({ ...prev, downloads: 'Failed to load downloads count' }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractionData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/interaction-stats', 
        { withCredentials: true });
      
      if (response.data.success) {
        setInteractionData(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching interaction data:', error);
    }
  };

  const prepareChartData = () => {
    return [
      { name: 'Comments', value: stats.comments },
      { name: 'Likes Today', value: stats.likesToday },
      { name: 'Saved', value: stats.saved },
      { name: 'Downloads', value: stats.downloads }
    ];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
            <div className="admin-stat-card">
              <h3>Downloads</h3>
              <div className="stat-numbers">
                {loading ? 'Loading...' : errors.downloads ? 'Error' : stats.downloads.toLocaleString()}
              </div>
              <p>Total downloaded articles</p>
              {errors.downloads && <p className="error-text">{errors.downloads}</p>}
            </div>
          </div>

          <div className="admin-charts-section">
            <div className="chart-controls">
              <h2>User Interaction Analysis</h2>
              <div className="chart-toggle">
                <button 
                  className={`chart-toggle-btn ${chartView === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartView('bar')}
                >
                  Bar Chart
                </button>
                <button 
                  className={`chart-toggle-btn ${chartView === 'pie' ? 'active' : ''}`}
                  onClick={() => setChartView('pie')}
                >
                  Pie Chart
                </button>
              </div>
            </div>

            <div className="chart-container">
              {chartView === 'bar' ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={prepareChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={prepareChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {interactionData.length > 0 && (
              <div className="interaction-analysis">
                <h3>User Engagement Insights</h3>
                <div className="insights-container">
                  <div className="insight-card">
                    <h4>Most Active Time</h4>
                    <p>Users are most active between 12:00 PM and 3:00 PM</p>
                  </div>
                  <div className="insight-card">
                    <h4>Download Rate</h4>
                    <p>{((stats.downloads / stats.users) * 100).toFixed(1)}% of users download articles</p>
                  </div>
                  <div className="insight-card">
                    <h4>Engagement Rate</h4>
                    <p>{((stats.comments / stats.users) * 100).toFixed(1)}% user comment engagement</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}