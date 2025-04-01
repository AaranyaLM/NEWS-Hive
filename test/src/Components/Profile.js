import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        articles: 0,
        likes: 0,
        comments: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        setUserStats({
            articles: 12,
            likes: 142,
            comments: 38
        });
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUser(data.user);
            } else {
                // Redirect to login if not authenticated
                navigate('/userauth');
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            navigate('/userauth');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="instagram-profile-container">
            <div className="profile-header">
                {/* <div className="profile-picture">
                    <div className="avatar-circle">
                        {user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                </div> */}
                <div className="profile-info">
                    <h1 className="profile-username">{user?.username}</h1>
                    <div className="user-stats">
                        <div className="stat-item">
                            <span className="stat-number">{userStats.articles}</span>
                            <span className="stat-label">saved</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{userStats.likes}</span>
                            <span className="stat-label">likes</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{userStats.comments}</span>
                            <span className="stat-label">comments</span>
                        </div>
                    </div>
                    <button className="edit-profile-btn">Edit Profile</button>
                </div>
            </div>
            
            <div className="bio-section">
                <p className="joined-date">Joined {user?.createdAt}</p>
                <p className="bio-text">{user?.bio || 'No bio available. Add one to tell others about yourself!'}</p>
            </div>
            
            <div className="content-tabs">
                <div className="tab active">SAVED</div>
                <div className="tab">LIKED</div>
                <div className="tab">COMMENTS</div>
            </div>
            
            <div className="content-grid">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="grid-item">
                        <div className="article-thumbnail">
                            <div className="placeholder-thumbnail">Article {item}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Profile;