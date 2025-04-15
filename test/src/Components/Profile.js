import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Toast from './Toast';
import SavedArticles from './SavedArticles';
import UserComments from './UserComments';

function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        articles: 0,
        comments: 0
    });
    const [activeTab, setActiveTab] = useState('saved');
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
        // Load user profile and stats
        const loadProfileData = async () => {
            const profileLoaded = await fetchUserProfile();
            if (profileLoaded) {
                await fetchUserStats();
            }
            setIsLoading(false);
        };
        
        loadProfileData();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUser(data.user);
                return true;
            } else {
                // Redirect to login if not authenticated
                navigate('/userauth');
                return false;
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            navigate('/userauth');
            return false;
        }
    };

    const fetchUserStats = async () => {
        try {
            // Fetch articles count
            const articlesResponse = await fetch('http://localhost:5000/api/user/saved-articles/count', {
                credentials: 'include'
            });
            
            const articlesData = await articlesResponse.json();
            
            // Fetch comments count
            const commentsResponse = await fetch('http://localhost:5000/api/user/comments/count', {
                credentials: 'include'
            });
            
            const commentsData = await commentsResponse.json();
            
            // Update stats
            setUserStats({
                articles: articlesData.count || 0,
                comments: commentsData.count || 0
            });
            
            return true;
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
            return false;
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'saved':
                return <SavedArticles />;
            case 'comments':
                return <UserComments />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="content-loader">
                <div className="loader-pulse"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="instagram-profile-container">
            {/* Toast Component */}
            <Toast 
                message={toast.message}
                visible={toast.visible}
                onHide={hideToast}
                duration={2000}
            />
            
            <div className="profile-header">
                <div className="profile-picture">
                    <div className="avatar-circle">
                        {user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                </div> 
                <div className="profile-info">
                    <h1 className="profile-username">{user?.username}</h1>
                    <div className="user-stats">
                        <div className="stat-item">
                            <span className="stat-number">{userStats.articles}</span>
                            <span className="stat-label">saved</span>
                        </div>
                     
                        <div className="stat-item">
                            <span className="stat-number">{userStats.comments}</span>
                            <span className="stat-label">comments</span>
                        </div>
                    </div>
                    <button 
                        className="edit-profile-btn"
                        onClick={() => navigate('/edit-profile')}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
            
            <div className="bio-section">
                <p className="joined-date">Joined {formatDate(user?.createdAt || new Date())}</p>
                <p className="bio-text">{user?.bio || 'No bio available. Add one to tell others about yourself!'}</p>
            </div>
            
            <div className="content-tabs">
                <div 
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => handleTabChange('saved')}
                >
                    SAVED
                </div>
                <div 
                    className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => handleTabChange('comments')}
                >
                    COMMENTS
                </div>
            </div>
            
            <div className="articles-container">
                {renderTabContent()}
            </div>
        </div>
    );
}

export default Profile;