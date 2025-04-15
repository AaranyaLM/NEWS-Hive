import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCommentAlt, FaExternalLinkAlt } from 'react-icons/fa';
import Toast from './Toast';

function UserComments() {
    const [userComments, setUserComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [user, setUser] = useState(null);
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
        // Load user profile and comments
        const loadData = async () => {
            const userLoaded = await fetchUserProfile();
            if (userLoaded) {
                await fetchUserComments();
            }
            setIsLoading(false);
        };
        
        loadData();
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
            }
            return true;
        } catch (error) {
            console.error('Failed to fetch user comments:', error);
            setUserComments([]);
            return false;
        }
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

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
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

    if (isLoading) {
        return (
            <div className="content-loader">
                <div className="loader-pulse"></div>
                <p>Loading comments...</p>
            </div>
        );
    }

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
        <div className="user-comments-container">
            {/* Toast Component */}
            <Toast 
                message={toast.message}
                visible={toast.visible}
                onHide={hideToast}
                duration={2000}
            />
            
            <div className="comments-list">
                {userComments.map((comment, index) => {
                    // Access the full article data stored in each comment
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
        </div>
    );
}

export default UserComments;