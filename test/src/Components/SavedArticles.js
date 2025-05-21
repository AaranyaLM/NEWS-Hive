import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookmark, FaBookmark as FaBookmarkSolid, FaDownload, FaEllipsisV, FaShareAlt } from 'react-icons/fa';
import Toast from './Toast';

function SavedArticles() {
    const [savedArticles, setSavedArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [shared, setShared] = useState(null);
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingDownload, setLoadingDownload] = useState(null);
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
        // Load user profile and saved articles
        const loadData = async () => {
            const userLoaded = await fetchUserProfile();
            if (userLoaded) {
                await fetchSavedArticles();
            }
            setIsLoading(false);
        };
        
        loadData();
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
                setCurrentUser(data.user); // Set currentUser state as well
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

    const fetchSavedArticles = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/saved-articles', {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Sort articles by date (newest first)
                const sortedArticles = data.articles.sort((a, b) => {
                    const dateA = new Date(a.publishedAt);
                    const dateB = new Date(b.publishedAt);
                    return dateB - dateA; // Descending order (newest first)
                });
                
                setSavedArticles(sortedArticles);
            }
            return true;
        } catch (error) {
            console.error('Failed to fetch saved articles:', error);
            setSavedArticles([]);
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

    // Toggle menu open/closed
    const toggleMenu = (e, articleId) => {
        e.stopPropagation(); // Prevent event bubbling
        setOpenMenuId(openMenuId === articleId ? null : articleId);
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
                showToast('Article removed from saved items');
            }
        } catch (error) {
            console.error('Error unsaving article:', error);
            showToast('Failed to remove article');
        }
    };

   const handleDownload = async (e, article) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      setLoadingDownload(article.url); // Track which article is downloading
      
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
      showToast('Article downloaded successfully');
      
    } catch (error) {
      console.error('Error downloading article:', error);
      showToast('Failed to download the article');
    } finally {
      setLoadingDownload(null);
      setOpenMenuId(null); // Close the menu
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

    if (isLoading) {
        return (
            <div className="content-loader">
                <div className="loader-pulse"></div>
                <p>Loading saved articles...</p>
            </div>
        );
    }

    if (savedArticles.length === 0) {
        return (
            <div className="no-articles">
                <div className="no-content-message">
                    <FaBookmark size={32} />
                    <p>You haven't saved any articles yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="saved-articles-container">
            {/* Toast Component */}
            <Toast 
                message={toast.message}
                visible={toast.visible}
                onHide={hideToast}
                duration={2000}
            />
            
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
        </div>
    );
}

export default SavedArticles;