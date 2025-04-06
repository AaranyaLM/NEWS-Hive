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
    const [activeTab, setActiveTab] = useState('saved');
    const [userComments, setUserComments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
        fetchUserComments();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUser(data.user);
                setUserStats({
                    articles: 12,
                    likes: 142,
                    comments: data.user.commentCount || 38
                });
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

    const fetchUserComments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/comments', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUserComments(data.comments);
                // Update the comments count in userStats
                setUserStats(prev => ({
                    ...prev,
                    comments: data.comments.length
                }));
            }
        } catch (error) {
            console.error('Failed to fetch user comments:', error);
            setUserComments([]);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle clicking on a news article - navigate to Content page
    const handleArticleClick = (article) => {
        // Store article data in sessionStorage for the Content component to use
        sessionStorage.setItem("currentArticle", JSON.stringify(article));
        // Navigate to your content page
        window.open('/content', '_blank');
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'saved':
                return (
                    <div className="content-grid">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="grid-item">
                                <div className="article-thumbnail">
                                    <div className="placeholder-thumbnail">Saved Article {item}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'comments':
                return (
                    <div className="comments-list">
                        {userComments.length > 0 ? userComments.map((comment, index) => (
                            <div key={index} className="comment-item">
                                <h3 className="article-title" onClick={() => handleArticleClick(comment.articleData)} >
                                    {comment.articleTitle || 'News Article'}
                                </h3>
                                <p className="comment-text">{comment.text}</p>
                                <span className="comment-date">{formatDate(comment.timestamp)}</span>
                            </div>
                        )) : (
                            <div className="no-comments">
                                <p>You haven't commented on any articles yet.</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
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
                    <button 
                        className="edit-profile-btn"
                        onClick={() => navigate('/edit-profile')}
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
            
            <div className="bio-section">
                <p className="joined-date">Joined {user?.createdAt}</p>
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
            
            {renderTabContent()}
        </div>
    );
}

export default Profile;