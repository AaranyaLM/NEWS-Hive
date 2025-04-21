import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCommentAlt, FaSearch, FaUser } from 'react-icons/fa';
import './AdminUsers.css'; 
import AdminNavbar from '../../Components/Admin/AdminNavbar';
import Toast from '../../Components/Toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    is_verified: 0,
    bio: ''
  });
  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/admin/users', { withCredentials: true });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Hide toast notification
  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      is_verified: user.is_verified || 0,
      bio: user.bio || ''
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(
        `http://localhost:5000/admin/users/${selectedUser.id}`, 
        formData, 
        { withCredentials: true }
      );
      
      // Update local state with the updated user
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      ));
      
      setIsEditing(false);
      setSelectedUser(null);
      showToast(`User ${formData.username} updated successfully!`);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
      showToast('Failed to update user. Please try again.', 'error');
    }
  };

  // Show delete confirmation modal
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Cancel delete operation
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Confirm delete operation
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`http://localhost:5000/admin/users/${userToDelete.id}`, { withCredentials: true });
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      showToast(`User ${userToDelete.username || userToDelete.email} deleted successfully!`);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
      showToast('Failed to delete user. Please try again.', 'error');
    }
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <>
      <AdminNavbar />
      <div className="admin-users-container">
        {/* Toast notification */}
        <Toast 
          message={toast.message}
          visible={toast.visible}
          onHide={hideToast}
          duration={3000}
          type={toast.type}
        />

        <div className="admin-users-header">
          <div className='user-header'>
          <h1>User Management</h1>
          <p>View and moderate all users</p>
          </div>
        
          <div className="admin-search-bar">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="search-icon" />
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="delete-modal-backdrop">
            <div className="delete-modal">
              <div className="delete-modal-header">
                <h3>Confirm Deletion</h3>
                <button className="close-button" onClick={handleCancelDelete}>×</button>
              </div>
              <div className="delete-modal-body">
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                {userToDelete && (
                  <div className="user-to-delete-info">
                    <p><strong>Email:</strong> {userToDelete.email}</p>
                    {userToDelete.username && <p><strong>Username:</strong> {userToDelete.username}</p>}
                  </div>
                )}
              </div>
              <div className="delete-modal-footer">
                <button className="cancel-button" onClick={handleCancelDelete}>Cancel</button>
                <button className="delete-confirm-button" onClick={handleConfirmDelete}>Delete User</button>
              </div>
            </div>
          </div>
        )}

        {isEditing && selectedUser ? (
          <div className="admin-user-edit-form">
            <h2>Edit User</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="is_verified"
                  name="is_verified"
                  checked={formData.is_verified === 1}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_verified">Verified User</label>
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="admin-users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`verification-badge ${user.is_verified ? 'verified' : 'not-verified'}`}>
                          {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button 
                          className="edit-button" 
                          onClick={() => handleEditClick(user)}
                          aria-label="Edit user"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button 
                          className="delete-button" 
                          onClick={() => handleDeleteClick(user)}
                          aria-label="Delete user"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">No users found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}