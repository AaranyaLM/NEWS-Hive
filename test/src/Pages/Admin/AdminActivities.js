import { useState, useEffect } from 'react';
import { FaSearch, FaUserShield, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import './AdminActivities.css';
import AdminNavbar from '../../Components/Admin/AdminNavbar';
import Toast from '../../Components/Toast';

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'user', 'comment', 'login'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchTerm, filterType, dateFilter, activities]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/activities', { 
        withCredentials: true 
      });
      
      if (response.data.success) {
        setActivities(response.data.activities);
        setFilteredActivities(response.data.activities);
      } else {
        showToast('Failed to fetch activities', 'error');
      }
    } catch (error) {
      console.error('Error fetching admin activities:', error);
      showToast('An error occurred while fetching activities', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast({
      ...toast,
      visible: false
    });
  };

  const filterActivities = () => {
    let filtered = [...activities];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.action_type === filterType);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let dateLimit;
      
      switch (dateFilter) {
        case 'today':
          dateLimit = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          dateLimit = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          dateLimit = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          dateLimit = null;
      }
      
      if (dateLimit) {
        filtered = filtered.filter(activity => new Date(activity.timestamp) >= dateLimit);
      }
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.admin_email?.toLowerCase().includes(term) ||
        activity.description?.toLowerCase().includes(term) ||
        activity.target_username?.toLowerCase().includes(term) ||
        activity.details?.toLowerCase().includes(term)
      );
    }
    
    setFilteredActivities(filtered);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return <FaUserShield className="activity-icon user" />;
      case 'comment':
        return <FaUserShield className="activity-icon comment" />;
      case 'login':
        return <FaUserShield className="activity-icon login" />;
      default:
        return <FaUserShield className="activity-icon" />;
    }
  };

  const getActivityClass = (type) => {
    return `activity-item ${type}`;
  };

  if (isLoading) {
    return (
      <div className="admin-content-loader">
        <div className="loader-pulse"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-activities-container">
        <div className="admin-content-header">
          <h2>Admin Activity Log</h2>
          <p>Track all administrative actions within the system</p>
        </div>

        {/* Toast notification */}
        <Toast 
          message={toast.message}
          visible={toast.visible}
          onHide={hideToast}
          duration={3000}
          type={toast.type}
        />

        {/* Search and filter controls */}
        <div className="admin-filters">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          
          <div className="filter-container">
            <div className="admin-filter-group">
              <label>Action Type:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="admin-filter-select"
              >
                <option value="all">All Actions</option>
                <option value="user">User Management</option>
                <option value="comment">Comment Moderation</option>
                <option value="login">Admin Login</option>
              </select>
            </div>
            
            <div className="admin-filter-group">
              <label>Time Period:</label>
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="admin-filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity List */}
        {filteredActivities.length === 0 ? (
          <div className="no-activities-found">
            <div className="no-content-message">
              <FaCalendarAlt size={32} />
              <p>{searchTerm || filterType !== 'all' || dateFilter !== 'all' ? 
                'No matching activities found.' : 
                'No admin activities recorded yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="admin-activities-list">
            <div className="activities-count">
              Showing {filteredActivities.length} of {activities.length} activities
            </div>
            
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={getActivityClass(activity.action_type)}
              >
                <div className="activity-header">
                  {getActivityIcon(activity.action_type)}
                  <div className="activity-title">
                    <h3>{activity.action}</h3>
                    <span className="activity-admin">{activity.admin_email}</span>
                  </div>
                  <span className="activity-time">{formatDate(activity.timestamp)}</span>
                </div>
                
                <div className="activity-details">
                  <p>{activity.description}</p>
                  {activity.target_username && (
                    <div className="activity-target">
                      <strong>User:</strong> {activity.target_username}
                    </div>
                  )}
                  {activity.details && (
                    <div className="activity-additional-details">
                      <strong>Details:</strong> {activity.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}