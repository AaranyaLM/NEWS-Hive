import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Profile.css'; // Use the same styling
import UserComments from './UserComments';

function UserProfile() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        articles: 0,
        comments: 0
    });
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // First check if this is the current user
        const checkCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setCurrentUser(data.user);
                    
                    // If viewing your own profile, redirect to profile page
                    if (data.user.id.toString() === userId.toString()) {
                        navigate('/profile');
                        return false;
                    }
                }
                return true;
            } catch (error) {
                console.error('Error checking current user:', error);
                return true; // Continue loading this page
            }
        };
        
        const loadProfileData = async () => {
            const shouldContinue = await checkCurrentUser();
            if (!shouldContinue) return;
            
            try {
                // Fetch user profile
                const userResponse = await fetch(`http://localhost:5000/api/user/${userId}`, {
                    credentials: 'include'
                });
                
                const userData = await userResponse.json();
                
                if (!userData.success) {
                    navigate('/not-found');
                    return;
                }
                
                setUser(userData.user);
                
                // Fetch user stats
                const statsResponse = await fetch(`http://localhost:5000/api/user/${userId}/stats`, {
                    credentials: 'include'
                });
                
                const statsData = await statsResponse.json();
                
                if (statsData.success) {
                    setUserStats({
                        articles: statsData.articles || 0,
                        comments: statsData.comments || 0
                    });
                }
            } catch (error) {
                console.error('Error loading profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadProfileData();
    }, [userId, navigate]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
                            <span className="stat-number">{userStats.comments}</span>
                            <span className="stat-label">comments</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{userStats.articles}</span>
                            <span className="stat-label">saved</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bio-section">
                <p className="joined-date">Joined {formatDate(user?.createdAt || new Date())}</p>
                <p className="bio-text">{user?.bio || 'No bio available.'}</p>
            </div>
            
            <div className="content-tabs">
                <div className="tab active">
                    COMMENTS
                </div>
            </div>
            
            <div className="articles-container">
                <UserComments userId={userId} />
            </div>
        </div>
    );
}

export default UserProfile;