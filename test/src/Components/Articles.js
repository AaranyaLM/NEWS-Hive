import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Articles.css';

const Articles = ({ articles }) => {
  const navigate = useNavigate();

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (error) {
      return null;
    }
  };

  const handleReadMore = (article, e) => {
    e.preventDefault();
    
    // Store the article data in sessionStorage
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    
    // Open content page in new tab
    const contentUrl = `${window.location.origin}/content`;
    window.open(contentUrl, '_blank');
  };

  return (
    <div className="articles">
      {articles.length > 0 ? (
        articles.map((article, index) => {
          const faviconUrl = getFaviconUrl(article.url);
          return (
            <div key={index} className="article">
              <div className="article-header">
                <div className="source-info">
                  {faviconUrl && <img src={faviconUrl} alt="Source Logo" className="favicon" />}
                  <div className="source">{article.source.name || 'Unknown Source'}</div>
                </div>
                <div className="time">{new Date(article.publishedAt).toLocaleString()}</div>
              </div>
              <div className="article-content">
                <h2>{article.title}</h2>
                {article.urlToImage && <img src={article.urlToImage} alt={article.title} />}
                <p>{article.description}</p>
              </div>
              <div className="article-actions">
                <button>👍 Like</button>
                <button>🔗 Share</button>
                <button 
                  onClick={(e) => handleReadMore(article, e)}
                  className="read-more-button"
                >
                  Read More
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p>Loading news...</p>
      )}
    </div>
  );
};

export default Articles;