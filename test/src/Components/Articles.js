import React from 'react';
import './Articles.css';

const Articles = ({ articles }) => {
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (error) {
      return null; // Return null if URL is invalid
    }
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
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read More
                </a>
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
