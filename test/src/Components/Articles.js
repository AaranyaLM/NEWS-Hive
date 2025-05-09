import React, { useState, useEffect } from 'react';
import './Articles.css';
import { FaThumbsUp, FaThumbsUp as FaThumbsUpSolid, FaShareAlt, FaCommentAlt, FaTimes, FaPaperPlane, FaEllipsisV, FaBookmark, FaDownload, FaBookmark as FaBookmarkSolid } from 'react-icons/fa';

const Articles = ({ articles }) => {
  const [likedArticles, setLikedArticles] = useState({});
  const [savedArticles, setSavedArticles] = useState({}); // Track saved articles
  const [shared, setShared] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showCommentSidebar, setShowCommentSidebar] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingLikes, setLoadingLikes] = useState(true);
  // State for tracking floating like button animations
  const [floatingLikes, setFloatingLikes] = useState({});
  // State for tracking which article has its menu open
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loadingDownload, setLoadingDownload] = useState(null);

  const generateArticleId = (article) => {
    // Log to confirm encoding is identical to what's in the database
    const encoded = encodeURIComponent(article.url);
    return encoded;
  };

  useEffect(() => {
    // Fetch authentication status when component mounts
    fetchAuthStatus();
  }, []);

  useEffect(() => {
    // Fetch user interaction data once we have articles and user
    if (articles.length > 0 && currentUser) {
      fetchUserInteractions();
    }
  }, [articles, currentUser]);
  
  useEffect(() => {
    // Fetch comments when an article is selected
    if (currentArticle) {
      fetchComments(currentArticle);
    }
  }, [currentArticle]);

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

  const fetchAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/status', {
        credentials: 'include' // Important for cookies/session
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setCurrentUser(data.user);
      } else {
        // Redirect to login page if not authenticated
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching auth status:', error);
    }
  };

  // Modified to fetch user's interaction data (including saves)
  const fetchUserInteractions = async () => {
    setLoadingLikes(true);
    try {
      // Create an array of all article IDs to check
      const articleIds = articles.map(article => generateArticleId(article));
      
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
      const savedArticlesMap = {};
      
      interactions.forEach(interaction => {
        if (interaction.liked) {
          likedArticlesMap[interaction.articleId] = true;
        }
        if (interaction.saved) {
          savedArticlesMap[interaction.articleId] = true;
        }
      });
      
      setLikedArticles(likedArticlesMap);
      setSavedArticles(savedArticlesMap);
    } catch (error) {
      console.error('Error fetching user interactions:', error);
    } finally {
      setLoadingLikes(false);
    }
  };

const checkAllComments = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/debug/all-comments');
    const data = await response.json();
    console.log('ALL COMMENTS DEBUG:', data);
    alert(`Found ${data.allComments.length} comments in total`);
  } catch (error) {
    console.error('Error checking all comments:', error);
  }
};

const toggleLike = async (article) => {
  if (!currentUser) return;
  
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
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ 
        articleId,
        article: article // Send the full article object
      }),
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

  // Handle double-click on image to like with floating animation
  const handleImageDoubleClick = (article, event) => {
    if (!currentUser) return;
    
    const articleId = generateArticleId(article);
    
    // Create floating like button animation
    // Get position where the user clicked
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Show floating like animation
    setFloatingLikes(prev => ({
      ...prev,
      [articleId]: { x, y, show: true }
    }));
    
    // Hide after animation completes
    setTimeout(() => {
      setFloatingLikes(prev => ({
        ...prev,
        [articleId]: { ...prev[articleId], show: false }
      }));
    }, 1000);
    
    // Also trigger the actual like
    toggleLike(article);
  };

  const openCommentSidebar = (article) => {
    setCurrentArticle(article);
    setShowCommentSidebar(true);
  };

  const closeCommentSidebar = () => {
    setShowCommentSidebar(false);
    setCurrentArticle(null);
    setCommentText('');
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentArticle || !currentUser) return;
  
    const articleId = generateArticleId(currentArticle);
    const commentTextCopy = commentText; // Store a copy of the comment text
    
    // Clear the input field immediately for better UX
    setCommentText('');
    
    try {
      const response = await fetch('http://localhost:5000/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          articleId,
          text: commentTextCopy,
          article: currentArticle // Send the full article object
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      // Instead of modifying the comments directly, fetch them again
      // This ensures we have the most up-to-date list including our new comment
      await fetchComments(currentArticle);
      
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };
  
  const fetchComments = async (article) => {
    setLoading(true);
    try {
      const articleId = generateArticleId(article);
      const response = await fetch(`http://localhost:5000/api/comments/${encodeURIComponent(articleId)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Server returned status:', response.status);
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched comments:', data); // Log the whole data object
      
      if (currentArticle && generateArticleId(currentArticle) === articleId) {
        setComments(Array.isArray(data.comments) ? data.comments : []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (article) => {
    if (!currentUser) return;
    
    const articleId = generateArticleId(article);
    await fetch('http://localhost:5000/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ 
        articleId,
        article: article // Send the full article object
      }),
    });
  
    navigator.clipboard.writeText(article.url);
    setShared(articleId);
    setTimeout(() => setShared(null), 2000);
  };

  const handleReadMore = async (article, e) => {
    if (!currentUser) return;
    
    e.preventDefault();
    const articleId = generateArticleId(article);
  
    await fetch('http://localhost:5000/api/read-more', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ 
        articleId,
        article: article // Send the full article object
      }),
    });
  
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    localStorage.setItem('currentArticle', JSON.stringify(article));
    window.open(`${window.location.origin}/content`, '_blank');
  };

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  // Toggle menu open/closed
  const toggleMenu = (e, articleId) => {
    e.stopPropagation(); // Prevent event bubbling
    setOpenMenuId(openMenuId === articleId ? null : articleId);
  };

  // Updated save article function
  const handleSaveArticle = async (e, article) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const articleId = generateArticleId(article);
    
    // Update UI immediately for responsive feel
    setSavedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
    
    try {
      const response = await fetch('http://localhost:5000/api/save-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          articleId,
          article: article
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to save article');
      }
      
      // Close the menu after saving
      setOpenMenuId(null);
      
    } catch (error) {
      console.error('Error saving article:', error);
      // Revert the UI change if the server request fails
      setSavedArticles((prev) => ({
        ...prev,
        [articleId]: !prev[articleId],
      }));
    }
  };

  // Placeholder function for download
  const handleDownload = async (e, article) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      setLoadingDownload(article.url); // Add this state to track which article is downloading
      
      const articleId = generateArticleId(article);
      
      const response = await fetch('http://localhost:5000/api/download-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          articleId,
          article,
          userId: currentUser.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Create a blob from the PDF stream
      const blob = await response.blob();
      
      // Create a link element and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${article.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading article:', error);
      alert('Failed to download the article. Please try again.');
    } finally {
      setLoadingDownload(null);
      setOpenMenuId(null); // Close the menu
    }
  };

  return (
    <div className="articles-container">
      <div className="articles">
        {articles.length > 0 ? (
          articles.map((article, index) => {
            const faviconUrl = getFaviconUrl(article.url);
            const articleId = generateArticleId(article);
            return (
              <div key={index} className="article">
                <div className="article-header">
                  <div className="source-info">
                    {faviconUrl && <img src={faviconUrl} alt="Source Logo" className="favicon" />}
                    <div className="source-details">
                      <div className="source">{article.source.name || 'Unknown Source'}</div>
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
      onClick={(e) => handleSaveArticle(e, article)}
    >
      {savedArticles[articleId] ? (
        <><FaBookmarkSolid color="#187" /> Unsave</>
      ) : (
        <><FaBookmark /> Save</>
      )}
    </div>
    <div 
      className="menu-item" 
      onClick={(e) => handleDownload(e, article)}
    >
      {loadingDownload === article.url ? (
        <>Downloading...</>
      ) : (
        <><FaDownload /> Download</>
      )}
    </div>
  </div>
)}
                  </div>
                </div>
                <div className="article-content">
                  <h2>{article.title}</h2>
                  <div style={{ position: 'relative' }}>
                    {article.urlToImage && (
                      <>
                        <img 
                          src={article.urlToImage} 
                          alt={article.title} 
                          onDoubleClick={(e) => handleImageDoubleClick(article, e)}
                          style={{ cursor: 'pointer' }}
                        />
                        {floatingLikes[articleId]?.show && (
                          <div 
                            className="floating-like-button"
                            style={{
                              position: 'absolute',
                              left: `${floatingLikes[articleId].x}px`,
                              top: `${floatingLikes[articleId].y}px`,
                              transform: 'translate(-50%, -50%)',
                              animation: 'floatUp 1s forwards',
                              opacity: 1,
                              zIndex: 10
                            }}
                          >
                            <FaThumbsUpSolid color="#187" size={32} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <p>{article.description}</p>
                </div>
                <div className="article-actions">
                  <button 
                    onClick={() => toggleLike(article)} 
                    className="like-button"
                    data-article-id={articleId}
                  >
                    {likedArticles[articleId] ? <FaThumbsUpSolid color="#187" /> : <FaThumbsUp color="#000" />} Like
                  </button>
                  <button onClick={() => openCommentSidebar(article)} className="comment-button">
                    <FaCommentAlt color="#000" /> Comments
                  </button>
                  <button onClick={() => handleShare(article)} className="share-btn">
                    <FaShareAlt color="#000" /> {shared === articleId ? 'Copied!' : 'Share'}
                  </button>
                  <button onClick={(e) => handleReadMore(article, e)} className="read-more-button">
                    Read More
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="content-loader">
            <div className="loader-pulse"></div>
            <p>Loading news...</p>
          </div>
        )}
      </div>

      {/* Comment Sidebar */}
      {showCommentSidebar && (
        <div className="comment-sidebar">
          <div className="sidebar-header">
            <h3>Comments</h3>
            
            <button className="close-button" onClick={closeCommentSidebar}>
              <FaTimes />
            </button>
          </div>
          {/* Display article title */}
          {currentArticle && (
            <div className="article-title">
              <h4>{currentArticle.title}</h4>
            </div>
          )}
          
          <div className="comments-list">
            {loading ? (
              <div className="content-loader">
                <div className="loader-pulse"></div>
                <p>Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <div className="comment-user">{comment.username || currentUser?.username || 'User'}</div>
                  <div className="comment-text">{comment.text}</div>
                  <div className="comment-time">
                    {new Date(comment.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
          <div className="comment-form">
            <textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handleSubmitComment}><FaPaperPlane /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;