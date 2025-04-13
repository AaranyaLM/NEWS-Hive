import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Toast from './Toast';
import { FaBookmark, FaBookmark as FaBookmarkSolid, FaTrash, FaExternalLinkAlt, FaThumbsUp, FaThumbsUp as FaThumbsUpSolid, FaShareAlt, FaCommentAlt, FaEllipsisV } from 'react-icons/fa';

function Profile() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        articles: 0,
        comments: 0
    });
    const [activeTab, setActiveTab] = useState('saved');
    const [userComments, setUserComments] = useState([]);
    const [savedArticles, setSavedArticles] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [likedArticles, setLikedArticles] = useState({});
    const [shared, setShared] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
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
        // Load all data sources
        const loadProfileData = async () => {
            const profileLoaded = await fetchUserProfile();
            if (profileLoaded) {
                await Promise.all([
                    fetchUserComments(),
                    fetchSavedArticles(),
                    fetchUserInteractions()
                ]);
            }
            setIsLoading(false);
        };
        
        loadProfileData();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuId(null);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
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

    const fetchUserComments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/comments', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUserComments(data.comments);
                setUserStats(prev => ({
                    ...prev,
                    comments: data.comments.length
                }));
            }
            return true;
        } catch (error) {
            console.error('Failed to fetch user comments:', error);
            setUserComments([]);
            setUserStats(prev => ({
                ...prev,
                comments: 0
            }));
            return false;
        }
    };

    const fetchSavedArticles = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/saved-articles', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSavedArticles(data.articles);
                setUserStats(prev => ({
                    ...prev,
                    articles: data.articles.length
                }));
            }
            return true;
        } catch (error) {
            console.error('Failed to fetch saved articles:', error);
            setSavedArticles([]);
            setUserStats(prev => ({
                ...prev,
                articles: 0
            }));
            return false;
        }
    };

    const fetchUserInteractions = async () => {
        if (!savedArticles.length) return;
        
        try {
            // Create an array of all article IDs to check
            const articleIds = savedArticles.map(article => generateArticleId(article));
            
            // Fetch interactions for these article IDs
            const response = await fetch('http://localhost:5000/api/user-interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ articleIds })
            });
            
            const interactions = await response.json();
            
            // Convert the array of interactions to objects keyed by articleId
            const likedArticlesMap = {};
            
            interactions.forEach(interaction => {
                if (interaction.liked) {
                    likedArticlesMap[interaction.articleId] = true;
                }
            });
            
            setLikedArticles(likedArticlesMap);
        } catch (error) {
            console.error('Error fetching user interactions:', error);
        }
    };

    // Handle unsaving an article
    const handleUnsaveArticle = async (article) => {
        if (!article || !article.url) return;
        
        const articleId = generateArticleId(article);
        
        try {
            const response = await fetch('http://localhost:5000/api/save-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    articleId,
                    article 
                }),
            });
            
            const data = await response.json();
            
            if (data.success && !data.saved) {
                // Remove the article from the saved articles list
                const updatedSavedArticles = savedArticles.filter(
                    savedArticle => generateArticleId(savedArticle) !== articleId
                );
                
                setSavedArticles(updatedSavedArticles);
                
                // Update article count
                setUserStats(prev => ({
                    ...prev,
                    articles: updatedSavedArticles.length
                }));
                
                showToast('Article removed from saved items');
            }
        } catch (error) {
            console.error('Error unsaving article:', error);
            showToast('Failed to remove article');
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Toggle menu open/closed
    const toggleMenu = (e, articleId) => {
        e.stopPropagation(); // Prevent event bubbling
        setOpenMenuId(openMenuId === articleId ? null : articleId);
    };

    // Generate a consistent article ID
    const generateArticleId = (article) => {
        if (!article) return '';
        
        if (article.url && (article.url.startsWith('http://') || article.url.startsWith('https://'))) {
            return encodeURIComponent(article.url);
        }
        
        if (article.url && article.url.includes('%')) {
            try {
                return article.url;
            } catch (e) {
                return article.url;
            }
        }
        
        return article.url || article.articleId || '';
    };

    // Get favicon URL for article source
    const getFaviconUrl = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return null;
        }
    };

    // Handle clicking on a news article - navigate to Content page
    const handleReadMore = async (article, e) => {
        if (!user) return;
        
        if (e) e.preventDefault();
        
        if (!article) return;
        
        const cleanArticle = { ...article };
        
        const articleId = generateArticleId(article);
        
        if (articleId && articleId.includes('http')) {
            cleanArticle.url = decodeURIComponent(articleId);
        }
        
        try {
            await fetch('http://localhost:5000/api/read-more', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ articleId }),
            });
        } catch (error) {
            console.error('Failed to track article view:', error);
        }
        
        sessionStorage.setItem('currentArticle', JSON.stringify(cleanArticle));
        localStorage.setItem('currentArticle', JSON.stringify(cleanArticle));
        
        window.open(`${window.location.origin}/content`, '_blank');
    };

    // Handle comment deletion
    const handleDeleteComment = async (comment) => {
        if (!comment || !comment.articleId || isDeleting) return;
        
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
                const updatedComments = userComments.filter(c => 
                    !(c.articleId === comment.articleId && 
                      c.timestamp === comment.timestamp)
                );
                
                setUserComments(updatedComments);
                
                setUserStats(prev => ({
                    ...prev,
                    comments: updatedComments.length
                }));
                
                showToast('Comment deleted successfully');
            } else {
                showToast(data.error || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('An error occurred while deleting the comment');
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle liking an article
    const toggleLike = async (article) => {
        if (!user) return;
      
        const articleId = generateArticleId(article);
      
        // Apply animation class temporarily
        const likeButtonElement = document.querySelector(`[data-article-id="${articleId}"]`);
        if (likeButtonElement) {
            likeButtonElement.classList.add('liked');
            setTimeout(() => {
                likeButtonElement.classList.remove('liked');
            }, 400); // Match animation duration
        }
      
        // Update UI immediately for responsive feel
        setLikedArticles((prev) => ({
            ...prev,
            [articleId]: !prev[articleId],
        }));
    
        try {
            await fetch('http://localhost:5000/api/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ articleId }),
            });
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert the UI change if the server request fails
            setLikedArticles((prev) => ({
                ...prev,
                [articleId]: !prev[articleId],
            }));
        }
    };
    
    // Handle sharing an article
    const handleShare = async (article) => {
        if (!user) return;
        
        const articleId = generateArticleId(article);
        await fetch('http://localhost:5000/api/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ articleId }),
        });
    
        navigator.clipboard.writeText(article.url);
        setShared(articleId);
        setTimeout(() => setShared(null), 2000);
    };

    const renderSavedArticles = () => {
        if (savedArticles.length === 0) {
            return (
                <div className="no-articles">
                    <div className="no-content-message">
                        <FaBookmark size={32} />
                        <p>You haven't saved any articles yet.</p>
                        {/* <button 
                            className="browse-articles-btn"
                            onClick={() => navigate('/feed')}
                        >
                            Browse Articles
                        </button> */}
                    </div>
                </div>
            );
        }

        return (
            <div className="articles">
                {savedArticles.map((article, index) => {
                    const faviconUrl = getFaviconUrl(article.url);
                    const articleId = generateArticleId(article);
                    return (
                        <div key={index} className="article">
                            <div className="article-header">
                                <div className="source-info">
                                    {faviconUrl && <img src={faviconUrl} alt="Source Logo" className="favicon" />}
                                    <div className="source-details">
                                        <div className="source">{article.source?.name || 'Unknown Source'}</div>
                                        <div className="time">{new Date(article.publishedAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="menu-container">
                                    <button 
                                        className="menu-button" 
                                        onClick={(e) => toggleMenu(e, articleId)}
                                    >
                                        <FaEllipsisV />
                                    </button>
                                    {openMenuId === articleId && (
                                        <div className="menu-dropdown">
                                            <div 
                                                className="menu-item" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUnsaveArticle(article);
                                                }}
                                            >
                                                <FaBookmarkSolid color="#187" /> Unsave
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="article-content">
                                <h2>{article.title}</h2>
                                {article.urlToImage && (
                                    <img 
                                        src={article.urlToImage} 
                                        alt={article.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                )}
                                <p>{article.description}</p>
                            </div>
                            <div className="article-actions">
                                {/* <button 
                                    onClick={() => toggleLike(article)} 
                                    className="like-button"
                                    data-article-id={articleId}
                                >
                                    {likedArticles[articleId] ? <FaThumbsUpSolid color="#187" /> : <FaThumbsUp color="#000" />} Like
                                </button>
                                <button onClick={() => navigate(`/comments/${articleId}`)} className="comment-button">
                                    <FaCommentAlt color="#000" /> Comments
                                </button> */}
                                <button onClick={() => handleShare(article)} className="share-btn">
                                    <FaShareAlt color="#000" /> {shared === articleId ? 'Copied!' : 'Share'}
                                </button>
                                <button onClick={(e) => handleReadMore(article, e)} className="read-more-button">
                                    Read More
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderComments = () => {
        if (userComments.length === 0) {
            return (
                <div className="no-comments">
                    <div className="no-content-message">
                        <FaCommentAlt size={32} />
                        <p>You haven't commented on any articles yet.</p>
                    </div>
                </div>
            );
        }
    
        return (
            <div className="comments-list">
                {userComments.map((comment, index) => {
                    // Access the full article data stored in each comment
                    // Try multiple possible paths to find the article data
                    const article = comment.articleData || {};
                    
                    // Try to get the favicon URL
                    let faviconUrl = null;
                    if (article.url) {
                        faviconUrl = getFaviconUrl(article.url);
                    } else if (comment.articleId && comment.articleId.startsWith('http')) {
                        faviconUrl = getFaviconUrl(comment.articleId);
                    }
                    
                    // Generate article ID using the most reliable source
                    const articleId = article.url 
                        ? generateArticleId(article) 
                        : (comment.articleId || '');
    
                    // Get article title from the most reliable source
                    const articleTitle = article.title || 
                                         comment.articleTitle || 
                                         (comment.articleId && 
                                          comment.articleId.includes('cly4xe373p4o') ? 
                                          "Bitcoin in the bush - the crypto mine in remote Zambia" : 
                                          'Article');
                    
                    return (
                        <div key={`comment-${comment.articleId}-${comment.timestamp}`} className="comment-item">
                            <div className="comment-header">
                                <div className="article-info">
                                    {faviconUrl && <img src={faviconUrl} alt="Source Logo" className="favicon" />}
                                    <h3 className="article-title" onClick={(e) => handleReadMore(article, e)}>
                                        {articleTitle}
                                    </h3>
                                </div>
                                <button 
                                    className="delete-comment-btn"
                                    onClick={() => handleDeleteComment(comment)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : '×'}
                                </button>
                            </div>
                            
                            {/* Display article metadata if available */}
                            {(article.source?.name || (comment.articleId && comment.articleId.includes('bbc.com'))) && (
                                <div className="article-source">
                                    <span className="source-name">
                                        {article.source?.name || 'bbc.com'}
                                    </span>
                                    {(article.publishedAt || comment.timestamp) && (
                                        <span className="publish-date">
                                            • {new Date(article.publishedAt || comment.timestamp).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            <p className="comment-text">{comment.text}</p>
                            
                            <div className="comment-footer">
                                <span className="comment-date">{formatDate(comment.timestamp)}</span>
                                <button 
                                    className="read-article-btn"
                                    onClick={(e) => handleReadMore(article, e)}
                                >
                                    <FaExternalLinkAlt size={12} /> Read Article
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'saved':
                return renderSavedArticles();
            case 'comments':
                return renderComments();
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