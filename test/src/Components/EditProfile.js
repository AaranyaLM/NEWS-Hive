import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';
import Toast from './Toast'; // Import the Toast component

function EditProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [activeSection, setActiveSection] = useState('info');
    const [canChangeUsername, setCanChangeUsername] = useState(true);
    const [usernameTimeLeft, setUsernameTimeLeft] = useState(null);
    const navigate = useNavigate();
    
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
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUser(data.user);
                setFormData({
                    ...formData,
                    username: data.user.username,
                    bio: data.user.bio || ''
                });
                
                // Check if username can be changed
                if (data.user.lastUsernameChange) {
                    const lastChange = new Date(data.user.lastUsernameChange);
                    const timeElapsed = Date.now() - lastChange.getTime();
                    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
                    
                    if (timeElapsed < sevenDaysInMs) {
                        setCanChangeUsername(false);
                        // Calculate time left
                        const timeLeft = sevenDaysInMs - timeElapsed;
                        const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
                        setUsernameTimeLeft(daysLeft);
                    }
                }
            } else {
                // Redirect to login if not authenticated
                navigate('/userauth');
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            navigate('/userauth');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear errors when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateProfileInfo = () => {
        const newErrors = {};
        
        if (activeSection === 'info') {
            if (formData.username.trim() === '') {
                newErrors.username = 'Username is required';
            } else if (formData.username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters';
            }
            
            if (formData.bio && formData.bio.length > 255) {
                newErrors.bio = 'Bio cannot exceed 255 characters';
            }
        } else if (activeSection === 'password') {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }
            
            if (!formData.newPassword) {
                newErrors.newPassword = 'New password is required';
            } else if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'Password must be at least 6 characters';
            }
            
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateProfileInfo()) {
            return;
        }
        
        try {
            let endpoint = 'http://localhost:5000/api/user/update-profile';
            let payload = {};
            
            if (activeSection === 'info') {
                payload = {
                    username: formData.username !== user.username ? formData.username : undefined,
                    bio: formData.bio
                };
            } else if (activeSection === 'password') {
                endpoint = 'http://localhost:5000/api/user/change-password';
                payload = {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                };
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success toast instead of setting successMessage
                showToast(data.message || 'Profile updated successfully');
                
                if (activeSection === 'password') {
                    // Clear password fields after successful update
                    setFormData({
                        ...formData,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });
                } else if (activeSection === 'info' && payload.username) {
                    // Refresh user data to update the username change date
                    fetchUserProfile();
                }
            } else {
                setErrors({
                    ...errors,
                    form: data.message || 'Failed to update profile'
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrors({
                ...errors,
                form: 'An error occurred while updating your profile'
            });
        }
    };

    const switchSection = (section) => {
        setActiveSection(section);
        setErrors({});
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="edit-profile-container">
            {/* Toast Component */}
            <Toast 
                message={toast.message}
                visible={toast.visible}
                onHide={hideToast}
                duration={2000} // Display for 2 seconds
            />
            
            <h1>Edit Profile</h1>
            
            <div className="profile-sections">
                <div 
                    className={`section-tab ${activeSection === 'info' ? 'active' : ''}`}
                    onClick={() => switchSection('info')}
                >
                    Personal Information
                </div>
                <div 
                    className={`section-tab ${activeSection === 'password' ? 'active' : ''}`}
                    onClick={() => switchSection('password')}
                >
                    Change Password
                </div>
            </div>
            
            {errors.form && (
                <div className="error-message">{errors.form}</div>
            )}
            
            <form onSubmit={handleSubmit}>
                {activeSection === 'info' && (
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={user.email} 
                                disabled 
                                className="form-control disabled"
                            />
                            <small className="field-note">Email cannot be changed</small>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username"
                                value={formData.username} 
                                onChange={handleInputChange}
                                disabled={!canChangeUsername} 
                                className={`form-control ${!canChangeUsername ? 'disabled' : ''}`}
                            />
                            {errors.username && <div className="error-message">{errors.username}</div>}
                            {!canChangeUsername && (
                                <small className="field-note">
                                    You can change your username once every 7 days. 
                                    {usernameTimeLeft && ` You can change it again in ${usernameTimeLeft} day(s).`}
                                </small>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea 
                                id="bio" 
                                name="bio"
                                value={formData.bio} 
                                onChange={handleInputChange}
                                className="form-control"
                                rows="4"
                                maxLength="255"
                            ></textarea>
                            {errors.bio && <div className="error-message">{errors.bio}</div>}
                            <small className="field-note">
                                {255 - formData.bio.length} characters remaining
                            </small>
                        </div>
                    </div>
                )}
                
                {activeSection === 'password' && (
                    <div className="form-section">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input 
                                type="password" 
                                id="currentPassword" 
                                name="currentPassword"
                                value={formData.currentPassword} 
                                onChange={handleInputChange}
                                className="form-control"
                            />
                            {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                name="newPassword"
                                value={formData.newPassword} 
                                onChange={handleInputChange}
                                className="form-control"
                            />
                            {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword"
                                value={formData.confirmPassword} 
                                onChange={handleInputChange}
                                className="form-control"
                            />
                            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                        </div>
                    </div>
                )}
                
                <div className="form-actions">
                    <button type="submit" className="save-btn">Save Changes</button>
                    <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => navigate('/profile')}
                    >
                        Go Back
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProfile;