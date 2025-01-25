import React from 'react';
import './Articles.css';

const Articles = ({ articles }) => {
  return (
    <div className="articles">
      {articles.length > 0 ? (
        articles.map((article, index) => (
          <div key={index} className="article">
            <div className="article-header">
              <div>
                <div className="source">{article.source.name || 'Unknown Source'}</div>
                <div className="time">{new Date(article.publishedAt).toLocaleString()}</div>
              </div>
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
        ))
      ) : (
        <p>Loading news...</p>
      )}
    </div>
  );
};

export default Articles;
