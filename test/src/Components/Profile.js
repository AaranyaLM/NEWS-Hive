// Frontend changes to Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        articles: 0,
        comments: 0
    });
    const [activeTab, setActiveTab] = useState('saved');
    const [userComments, setUserComments] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
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

    // Generate a consistent article ID, ensuring URLs are properly handled
    const generateArticleId = (article) => {
        if (!article) return '';
        
        // If it's already a properly formatted URL, use it directly
        if (article.url && (article.url.startsWith('http://') || article.url.startsWith('https://'))) {
            return article.url;
        }
        
        // If it's an encoded URL, decode it first to prevent double encoding
        if (article.url && article.url.includes('%')) {
            try {
                return decodeURIComponent(article.url);
            } catch (e) {
                // If decoding fails, use as is
                return article.url;
            }
        }
        
        // Fall back to article ID or empty string
        return article.url || article.articleId || '';
    };

    // Handle clicking on a news article - navigate to Content page
    const handleArticleClick = async (article, e) => {
        if (!user) return;
        
        if (e) e.preventDefault();
        
        // Ensure we have valid article data
        if (!article) return;
        
        // Clean and prepare article object for storage
        const cleanArticle = { ...article };
        
        // Fix URL if needed before using it as an ID
        const articleId = generateArticleId(article);
        
        // Make sure the article has the proper URL
        if (articleId && articleId.startsWith('http')) {
            cleanArticle.url = articleId;
        }
        
        try {
            // Track the click (similar to read-more endpoint)
            await fetch('http://localhost:5000/api/read-more', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ articleId }),
            });
        } catch (error) {
            console.error('Failed to track article view:', error);
            // Continue even if tracking fails
        }
        
        // Store clean article in both sessionStorage and localStorage
        sessionStorage.setItem('currentArticle', JSON.stringify(cleanArticle));
        localStorage.setItem('currentArticle', JSON.stringify(cleanArticle));
        
        // Open content page in new tab
        window.open(`${window.location.origin}/content`, '_blank');
    };

    // NEW FUNCTION: Handle comment deletion
    const handleDeleteComment = async (comment) => {
        if (!comment || !comment.articleId || isDeleting) return;
        
        // Show loading state
        setIsDeleting(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/user/comments/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    articleId: comment.articleId,
                    timestamp: comment.timestamp
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove the deleted comment from the UI
                setUserComments(prevComments => 
                    prevComments.filter(c => 
                        !(c.articleId === comment.articleId && 
                          c.timestamp === comment.timestamp)
                    )
                );
                
                // Update comment count
                setUserStats(prev => ({
                    ...prev,
                    comments: prev.comments - 1
                }));
                
                // Show success feedback (optional)
                alert('Comment deleted successfully');
            } else {
                alert(data.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('An error occurred while deleting the comment');
        } finally {
            setIsDeleting(false);
        }
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
                                <div className="comment-header">
                                    <h3 className="article-title" onClick={(e) => handleArticleClick(comment.articleData, e)}>
                                       Commented on "{comment.articleData?.title || comment.articleTitle || 'Article'}"
                                    </h3>
                                    <button 
                                        className="delete-comment-btn"
                                        onClick={() => handleDeleteComment(comment)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : '×'}
                                    </button>
                                </div>
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