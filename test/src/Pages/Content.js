import React, { useState, useEffect } from "react";
import "./Content.css";
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const Content = () => {
  const [article, setArticle] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // First, check if the article exists in sessionStorage, if not, look in localStorage
    const storedArticle = sessionStorage.getItem("currentArticle") || localStorage.getItem("currentArticle");
    if (storedArticle) {
      setArticle(JSON.parse(storedArticle));
      sessionStorage.removeItem("currentArticle"); // Remove from sessionStorage if used
    } else {
      setError("No article data available.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      if (!article?.url) {
        setError("No article URL provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/scrape?url=${encodeURIComponent(article.url)}`);
        if (!response.ok) throw new Error("Failed to fetch content");
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (article) {
      fetchContent();
    }
  }, [article]);

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="content-loader">
          <div className="loader-pulse"></div>
          <p>Loading article...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!article || error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <div className="error-icon">!</div>
          <p className="error-message">{error || "No article data available."}</p>
          <button className="return-home" onClick={() => window.history.back()}>
            Return to Home
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="content-page">
        <div className="article-container">
          {article.urlToImage && (
            <div className="article-hero">
              <img src={article.urlToImage} alt={article.title} className="hero-image" />
            </div>
          )}
          
          <div className="article-meta">
            <div className="publisher-info">
              {getFaviconUrl(article.url) && (
                <img src={getFaviconUrl(article.url)} alt="Source Logo" className="favicon" />
              )}
              <span className="publisher-name">{article.source.name || "Unknown Source"}</span>
              <span className="meta-separator">•</span>
              <span className="time-stamp">{formatDate(article.publishedAt)}</span>
            </div>
            
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="visit-source-btn">
              View Original
            </a>
          </div>
          
          <h1 className="article-title">{article.title}</h1>
          
          {article.description && (
            <p className="article-description">{article.description}</p>
          )}
          
          <div className="article-body">
            {content ? (
              content.split("\n").map((paragraph, index) => (
                paragraph.trim() && <p key={index} className="article-paragraph">{paragraph}</p>
              ))
            ) : (
              <p className="no-content">Full article content could not be loaded. Please visit the original source.</p>
            )}
          </div>
          
          <div className="article-footer">
            <div className="tags">
              <span className="tag">News</span>
              {article.source && <span className="tag">{article.source.name}</span>}
            </div>
            
            {/* <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more-btn">
              Read Full Article
            </a> */}
          </div>
        </div>
        
        <div className="share-container">
          {/* <button className="share-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Share
          </button> */}
          {/* <button className="bookmark-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            Save
          </button> */}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Content;