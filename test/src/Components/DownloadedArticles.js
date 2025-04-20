import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Pages/SavedArticlePage.css'; // Reuse the same CSS
import { FaDownload, FaTrash, FaExternalLinkAlt, FaEllipsisV } from 'react-icons/fa';
import Toast from './Toast'; // Assuming you have the Toast component available

function DownloadedArticles() {
    const [downloadedArticles, setDownloadedArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
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

    // Fetch downloaded articles - no need for userId since we're using session auth
    useEffect(() => {
        const fetchDownloadedArticles = async () => {
            try {
                // Check if user is authenticated
                const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
                    credentials: 'include'
                });
                
                const profileData = await profileResponse.json();
                
                if (!profileData.success) {
                    console.error('User not authenticated');
                    navigate('/userauth');
                    return;
                }
                
                // Fetch downloaded articles using session auth
                const response = await fetch('http://localhost:5000/api/user/downloaded-articles', {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Sort articles by date (newest first) if they have dates
                    const sortedArticles = data.articles.sort((a, b) => {
                        if (a.articleData?.publishedAt && b.articleData?.publishedAt) {
                            const dateA = new Date(a.articleData.publishedAt);
                            const dateB = new Date(b.articleData.publishedAt);
                            return dateB - dateA; // Descending order (newest first)
                        }
                        return 0;
                    });
                    
                    setDownloadedArticles(sortedArticles);
                } else {
                    throw new Error(data.message || 'Failed to fetch downloaded articles');
                }
            } catch (error) {
                console.error('Error fetching downloaded articles:', error);
                setError(error.message || 'Could not load downloaded articles');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDownloadedArticles();
    }, [navigate]);

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

    // Toggle menu open/closed
    const toggleMenu = (e, articleId) => {
        e.stopPropagation(); // Prevent event bubbling
        setOpenMenuId(openMenuId === articleId ? null : articleId);
    };

    const downloadAgain = async (article) => {
        try {
            const response = await fetch('http://localhost:5000/api/download-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    articleId: article.articleId,
                    article: article.articleData
                    // userId is not needed - we'll use session auth
                })
            });
            
            if (response.ok) {
                // Create a download link for the PDF
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${article.articleData.title}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                showToast('Article downloaded successfully');
            } else {
                console.error('Failed to download article');
                showToast('Failed to download article');
            }
        } catch (error) {
            console.error('Error downloading article:', error);
            showToast('Error downloading article');
        }
    };

    const removeFromDownloads = async (articleId) => {
        try {
            // Show a loading toast
            showToast('Removing article...');
            
            // Do NOT encode the articleId - we want to send it exactly as it is
            console.log('Attempting to remove article with ID:', articleId);
            
            const response = await fetch(`http://localhost:5000/api/user/remove-download`, {
                method: 'POST', // Changed to POST for better handling of complex IDs
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    articleId: articleId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove the article from the local state
                setDownloadedArticles(prevArticles => 
                    prevArticles.filter(article => article.articleId !== articleId)
                );
                showToast('Article removed from downloads');
            } else {
                console.error('Failed to remove article:', data.message);
                showToast(data.message || 'Failed to remove from downloads');
            }
        } catch (error) {
            console.error('Error removing article from downloads:', error);
            showToast('Error removing from downloads');
        }
    };
    // Modified function to open the PDF when "Read More" is clicked
    const handleReadMore = async (article, e) => {
        if (e) e.preventDefault();
        
        if (!article || !article.articleData) return;
    
        try {
            showToast('Opening PDF...');
            
            // Request the PDF from the server
            const response = await fetch('http://localhost:5000/api/download-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    articleId: article.articleId,
                    article: article.articleData,
                    userId: article.userId  // Include userId if available in article object
                })
            });
            
            if (response.ok) {
                // Create a blob from the PDF Stream
                const blob = await response.blob();
                
                // Create a URL for the blob
                const url = window.URL.createObjectURL(blob);
                
                // Open the PDF in a new tab
                window.open(url, '_blank');
            } else {
                console.error('Failed to fetch PDF');
                showToast('Failed to open PDF');
            }
        } catch (error) {
            console.error('Error opening PDF:', error);
            showToast('Error opening PDF');
        }
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

    if (isLoading) {
        return (
            <div className="content-loader">
                <div className="loader-pulse"></div>
                <p>Loading downloaded articles...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <p>Error: {error}</p>
                <Link to="/" className="browse-link">Return to homepage</Link>
            </div>
        );
    }

    if (downloadedArticles.length === 0) {
        return (
            <div className="no-articles">
                <div className="no-content-message">
                    <FaDownload size={32} />
                    <p>You haven't downloaded any articles yet.</p>
                </div>
                <Link to="/" className="browse-link">Browse Articles</Link>
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
                {downloadedArticles.map((article, index) => {
                    const articleId = article.articleId;
                    const articleData = article.articleData;
                    const faviconUrl = articleData?.url ? getFaviconUrl(articleData.url) : null;
                    
                    return (
                        <div key={index} className="article">
                            <div className="article-header">
                                <div className="source-info">
                                    {faviconUrl && <img src={faviconUrl} alt="Source Logo" className="favicon" />}
                                    <div className="source-details">
                                        <div className="source">{articleData?.source?.name || 'Unknown Source'}</div>
                                        <div className="time">
                                            {articleData?.publishedAt ? 
                                                new Date(articleData.publishedAt).toLocaleString() : 
                                                'Unknown date'}
                                        </div>
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
                                                    downloadAgain(article);
                                                    setOpenMenuId(null);
                                                }}
                                            >
                                                <FaDownload /> Download Again
                                            </div>
                                            <div 
                                                className="menu-item" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromDownloads(articleId);
                                                    setOpenMenuId(null);
                                                }}
                                            >
                                                <FaTrash /> Remove
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="article-content">
                                <h2>{articleData?.title}</h2>
                                {articleData?.urlToImage && (
                                    <img 
                                        src={articleData.urlToImage} 
                                        alt={articleData.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                )}
                                <p>{articleData?.description}</p>
                            </div>
                            <div className="article-actions">
                                <button 
                                    onClick={(e) => handleReadMore(article, e)} 
                                    className="read-more-button"
                                >
                                    Open PDF
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DownloadedArticles;