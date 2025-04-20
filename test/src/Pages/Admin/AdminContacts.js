import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaSearch, FaUser, FaEllipsisV, FaClock, FaExclamationCircle, FaClipboardCheck } from 'react-icons/fa';
import Toast from '../../Components/Toast';
import './AdminContacts.css';
import AdminNavbar from '../../Components/Admin/AdminNavbar';

function AdminContacts() {
    const [allMessages, setAllMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all'); // 'all', 'subject', 'message', 'username'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'new', 'in_progress', 'resolved', 'closed'
    const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'low', 'normal', 'high', 'urgent'
    const [editingMessage, setEditingMessage] = useState(null);
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        unresolved: 0,
        byStatus: [],
        byPriority: []
    });
    
    // Form state for updating a message
    const [updateForm, setUpdateForm] = useState({
        status: '',
        admin_notes: ''
    });
    
    // Toast notification state
    const [toast, setToast] = useState({
        visible: false,
        message: ''
    });

    // Function to show toast message
    const showToast = (message) => {
        setToast({
            visible: true,
            message
        });
    };

    // Function to hide toast message
    const hideToast = () => {
        setToast({
            ...toast,
            visible: false
        });
    };

    useEffect(() => {
        fetchMessages();
        fetchStats();
    }, []);

    useEffect(() => {
        filterMessages();
    }, [searchTerm, searchBy, statusFilter, priorityFilter, allMessages]);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/contact/messages', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setAllMessages(data.messages);
                setFilteredMessages(data.messages);
            } else {
                showToast(data.message || 'Failed to fetch contact messages');
            }
        } catch (error) {
            console.error('Failed to fetch contact messages:', error);
            showToast('An error occurred while fetching contact messages');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/contact/stats', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch contact stats:', error);
        }
    };

    const filterMessages = () => {
        let filtered = [...allMessages];
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(message => message.status === statusFilter);
        }
        
        // Apply priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(message => message.priority === priorityFilter);
        }
        
        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(message => {
                if (searchBy === 'subject') {
                    return message.subject.toLowerCase().includes(term);
                } else if (searchBy === 'message') {
                    return message.message.toLowerCase().includes(term);
                } else if (searchBy === 'username') {
                    return message.username.toLowerCase().includes(term);
                } else { // 'all'
                    return (
                        message.subject.toLowerCase().includes(term) || 
                        message.message.toLowerCase().includes(term) || 
                        message.username.toLowerCase().includes(term)
                    );
                }
            });
        }
        
        setFilteredMessages(filtered);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle message deletion
    const handleDeleteMessage = async (messageId) => {
        if (isDeleting) return;
        
        setIsDeleting(true);
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/contact/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove the deleted message from both arrays
                const updatedMessages = allMessages.filter(m => m.id !== messageId);
                setAllMessages(updatedMessages);
                fetchStats(); // Refresh stats after deletion
                showToast('Message deleted successfully');
            } else {
                showToast(data.message || 'Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showToast('An error occurred while deleting the message');
        } finally {
            setIsDeleting(false);
            setActionMenuOpen(null); // Close action menu
        }
    };

    // Toggle action menu
    const toggleActionMenu = (messageId) => {
        setActionMenuOpen(actionMenuOpen === messageId ? null : messageId);
    };

    // Handle status update
    const handleUpdateMessage = async (e) => {
        e.preventDefault();
        
        if (!editingMessage) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/contact/messages/${editingMessage.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updateForm),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update the message in the array
                const updatedMessages = allMessages.map(m => {
                    if (m.id === editingMessage.id) {
                        return { ...m, ...updateForm, updated_at: new Date().toISOString() };
                    }
                    return m;
                });
                
                setAllMessages(updatedMessages);
                fetchStats(); // Refresh stats after update
                setEditingMessage(null); // Close edit form
                showToast('Message updated successfully');
            } else {
                showToast(data.message || 'Failed to update message');
            }
        } catch (error) {
            console.error('Error updating message:', error);
            showToast('An error occurred while updating the message');
        }
    };

    // Start editing a message
    const startEditing = (message) => {
        setEditingMessage(message);
        setUpdateForm({
            status: message.status,
            admin_notes: message.admin_notes || ''
        });
        setActionMenuOpen(null); // Close action menu
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingMessage(null);
    };

    // Get priority badge style
    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'low': return 'priority-badge low';
            case 'normal': return 'priority-badge normal';
            case 'high': return 'priority-badge high';
            case 'urgent': return 'priority-badge urgent';
            default: return 'priority-badge normal';
        }
    };

    // Get status badge style
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'new': return 'status-badge new';
            case 'in_progress': return 'status-badge in-progress';
            case 'resolved': return 'status-badge resolved';
            case 'closed': return 'status-badge closed';
            default: return 'status-badge new';
        }
    };

    // Format status text for display
    const formatStatus = (status) => {
        switch (status) {
            case 'in_progress': return 'In Progress';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    if (isLoading) {
        return (
            <div className="admin-content-loader">
                <div className="loader-pulse"></div>
                <p>Loading contact messages...</p>
            </div>
        );
    }

    return (
        <>
            <AdminNavbar />
            <div className="admin-contacts-container">
                <div className="admin-content-header">
                    <h2>User Contact Messages</h2>
                    <p>Manage and respond to user inquiries</p>
                </div>

                {/* Stats Section */}
                <div className="admin-stats-section">
                    <div className="admin-stats-card total">
                        <div className="admin-stats-icon">
                            <FaEnvelope />
                        </div>
                        <div className="admin-stats-info">
                            <h3>{stats.total}</h3>
                            <p>Total Messages</p>
                        </div>
                    </div>
                    <div className="admin-stats-card unresolved">
                        <div className="admin-stats-icon">
                            <FaExclamationCircle />
                        </div>
                        <div className="admin-stats-info">
                            <h3>{stats.unresolved}</h3>
                            <p>Unresolved</p>
                        </div>
                    </div>
                    <div className="admin-stats-card in-progress">
                        <div className="admin-stats-icon">
                            <FaClock />
                        </div>
                        <div className="admin-stats-info">
                            <h3>{stats.byStatus.find(s => s.status === 'in_progress')?.count || 0}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div className="admin-stats-card resolved">
                        <div className="admin-stats-icon">
                            <FaClipboardCheck />
                        </div>
                        <div className="admin-stats-info">
                            <h3>{stats.byStatus.find(s => s.status === 'resolved')?.count || 0}</h3>
                            <p>Resolved</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="admin-search-filters">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>

                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>Search by:</label>
                            <select 
                                value={searchBy} 
                                onChange={(e) => setSearchBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Fields</option>
                                <option value="subject">Subject</option>
                                <option value="message">Message</option>
                                <option value="username">Username</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Status:</label>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Statuses</option>
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Priority:</label>
                            <select 
                                value={priorityFilter} 
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Toast Component */}
                <Toast 
                    message={toast.message}
                    visible={toast.visible}
                    onHide={hideToast}
                    duration={3000}
                />

                {/* Contact Messages List */}
                <div className="admin-messages-container">
                    <div className="messages-count">
                        Showing {filteredMessages.length} of {allMessages.length} messages
                    </div>

                    {filteredMessages.length === 0 ? (
                        <div className="no-messages-found">
                            <div className="no-content-message">
                                <FaEnvelope size={32} />
                                <p>{searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 
                                    'No matching messages found.' : 
                                    'No contact messages available.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="message-list">
                            {filteredMessages.map((message) => (
                                <div key={message.id} className="message-card">
                                    {editingMessage && editingMessage.id === message.id ? (
                                        <div className="edit-message-form">
                                            <h3>Update Message Status</h3>
                                            <form onSubmit={handleUpdateMessage}>
                                                <div className="form-group">
                                                    <label htmlFor="status">Status:</label>
                                                    <select
                                                        id="status"
                                                        value={updateForm.status}
                                                        onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                                                        required
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                        <option value="closed">Closed</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="admin_notes">Admin Notes:</label>
                                                    <textarea
                                                        id="admin_notes"
                                                        value={updateForm.admin_notes}
                                                        onChange={(e) => setUpdateForm({...updateForm, admin_notes: e.target.value})}
                                                        rows="4"
                                                    ></textarea>
                                                </div>
                                                <div className="form-actions">
                                                    <button type="button" onClick={cancelEditing} className="cancel-btn">Cancel</button>
                                                    <button type="submit" className="update-btn">Update</button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="message-header">
                                                <div className="message-subject">
                                                    <h3>{message.subject}</h3>
                                                </div>
                                                <div className="message-actions">
                                                    <button 
                                                        className="action-menu-btn" 
                                                        onClick={() => toggleActionMenu(message.id)}
                                                        aria-label="Open message actions menu"
                                                    >
                                                        <FaEllipsisV />
                                                    </button>
                                                    {actionMenuOpen === message.id && (
                                                        <div className="action-menu">
                                                            <button onClick={() => startEditing(message)}>Edit</button>
                                                            <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="message-meta">
                                                <div className="message-user">
                                                    <FaUser className="user-icon" />
                                                    <span className="username">{message.username}</span>
                                                    <span className="email">({message.email})</span>
                                                </div>
                                                <div className="message-date">
                                                    <FaClock className="clock-icon" />
                                                    <span>{formatDate(message.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="message-badges">
                                                <span className={getPriorityBadgeClass(message.priority)}>
                                                    {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                                                </span>
                                                <span className={getStatusBadgeClass(message.status)}>
                                                    {formatStatus(message.status)}
                                                </span>
                                            </div>
                                            <div className="message-content">
                                                <p>{message.message}</p>
                                            </div>
                                            {message.admin_notes && (
                                                <div className="admin-notes">
                                                    <h4>Admin Notes:</h4>
                                                    <p>{message.admin_notes}</p>
                                                </div>
                                            )}
                                            {message.updated_at && message.updated_at !== message.created_at && (
                                                <div className="message-updated">
                                                    <span>Updated: {formatDate(message.updated_at)}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AdminContacts;