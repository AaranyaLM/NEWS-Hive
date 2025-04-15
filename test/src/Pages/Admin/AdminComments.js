import React, { useState, useEffect } from 'react';
import { FaCommentAlt, FaSearch, FaUser } from 'react-icons/fa';
import Toast from '../../Components/Toast';
import './AdminComments.css';
import AdminNavbar from '../../Components/Admin/AdminNavbar';

function AdminComments() {
    const [allComments, setAllComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all'); // 'all', 'comment', 'username'
    
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
        fetchAllComments();
    }, []);

    useEffect(() => {
        filterComments();
    }, [searchTerm, searchBy, allComments]);

    const fetchAllComments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/comments', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setAllComments(data.comments);
                setFilteredComments(data.comments);
            } else {
                showToast(data.error || 'Failed to fetch comments');
            }
        } catch (error) {
            console.error('Failed to fetch all comments:', error);
            showToast('An error occurred while fetching comments');
        } finally {
            setIsLoading(false);
        }
    };

    const filterComments = () => {
        if (!searchTerm.trim()) {
            setFilteredComments(allComments);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = allComments.filter(comment => {
            if (searchBy === 'comment') {
                return comment.text.toLowerCase().includes(term);
            } else if (searchBy === 'username') {
                return comment.username.toLowerCase().includes(term);
            } else { // 'all'
                return (
                    comment.text.toLowerCase().includes(term) || 
                    comment.username.toLowerCase().includes(term)
                );
            }
        });
        
        setFilteredComments(filtered);
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
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Handle comment deletion
    const handleDeleteComment = async (comment) => {
        if (!comment || !comment.articleId || isDeleting) return;
        
        setIsDeleting(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/admin/comments/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    articleId: comment.articleId,
                    userId: comment.userId,
                    timestamp: comment.timestamp
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove the deleted comment from both arrays
                const updatedComments = allComments.filter(c => 
                    !(c.articleId === comment.articleId && 
                      c.timestamp === comment.timestamp &&
                      c.userId === comment.userId)
                );
                
                setAllComments(updatedComments);
                filterComments(); // This will update filteredComments
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
            <div className="admin-content-loader">
                <div className="loader-pulse"></div>
                <p>Loading comments...</p>
            </div>
        );
    }

    return (
        <>
        <AdminNavbar></AdminNavbar>
        <div className="admin-comments-container">
        <div className="admin-content-header">
            <h2>Manage Comments</h2>
            <p>View and moderate all user comments</p>
        </div>

        {/* Search Controls */}
        <div className="admin-search-controls">
            <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search comments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                />
            </div>
            <div className="search-filter-options">
                <label>
                    <input
                        type="radio"
                        name="searchBy"
                        value="all"
                        checked={searchBy === 'all'}
                        onChange={() => setSearchBy('all')}
                    />
                    All
                </label>
                <label>
                    <input
                        type="radio"
                        name="searchBy"
                        value="comment"
                        checked={searchBy === 'comment'}
                        onChange={() => setSearchBy('comment')}
                    />
                    Comment Text
                </label>
                <label>
                    <input
                        type="radio"
                        name="searchBy"
                        value="username"
                        checked={searchBy === 'username'}
                        onChange={() => setSearchBy('username')}
                    />
                    Username
                </label>
            </div>
        </div>

        {/* Toast Component */}
        <Toast 
            message={toast.message}
            visible={toast.visible}
            onHide={hideToast}
            duration={2000}
        />
        
        {filteredComments.length === 0 ? (
            <div className="no-comments-found">
                <div className="no-content-message">
                    <FaCommentAlt size={32} />
                    <p>{searchTerm ? 'No matching comments found.' : 'No comments available.'}</p>
                </div>
            </div>
        ) : (
            <div className="admin-comments-list">
                <div className="comments-count">
                    Showing {filteredComments.length} of {allComments.length} comments
                </div>
                
                {filteredComments.map((comment, index) => {
                    // Access the full article data stored in each comment
                    const article = comment.articleData || {};
                    
                    // Try to get the favicon URL
                    let faviconUrl = null;
                    if (article.url) {
                        faviconUrl = getFaviconUrl(article.url);
                    } else if (comment.articleId && comment.articleId.startsWith('http')) {
                        faviconUrl = getFaviconUrl(comment.articleId);
                    }
                    
                    // Get article title from the most reliable source
                    const articleTitle = article.title || 
                                        comment.articleTitle || 
                                        (comment.articleId && 
                                        comment.articleId.includes('cly4xe373p4o') ? 
                                        "Bitcoin in the bush - the crypto mine in remote Zambia" : 
                                        'Article');
                    
                    return (
                        <div key={`comment-${comment.articleId}-${comment.timestamp}-${comment.userId}`} className="admin-comment-item">
                            <div className="comment-header">
                                <div className="article-info">
                                    {faviconUrl && <img src={faviconUrl} alt="Source Logo" className="favicon" />}
                                    <h3 className="article-title">
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
                            
                            <div className="commenter-info">
                                <FaUser className="user-icon" />
                                <span className="commenter-name">{comment.username}</span>
                            </div>
                            
                            <p className="comment-text">{comment.text}</p>
                            
                            <div className="comment-footer">
                                <span className="comment-date">{formatDate(comment.timestamp)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div></>
    );
}

export default AdminComments;