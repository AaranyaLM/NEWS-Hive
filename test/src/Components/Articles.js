import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Articles.css';
import { FaThumbsUp, FaThumbsUp as FaThumbsUpSolid, FaShareAlt, FaCommentAlt } from 'react-icons/fa';

const Articles = ({ articles }) => {
  const [likedArticles, setLikedArticles] = useState({});
  const [shared, setShared] = useState(null);

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
    sessionStorage.setItem('currentArticle', JSON.stringify(article));
    localStorage.setItem('currentArticle', JSON.stringify(article));
    const contentUrl = `${window.location.origin}/content`;
    window.open(contentUrl, '_blank');
  };

  const toggleLike = (index) => {
    setLikedArticles((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleShare = (articleUrl, index) => {
    navigator.clipboard.writeText(articleUrl).then(() => {
      setShared(index);
      setTimeout(() => setShared(null), 2000);
    });
  };

  const handleComment = (article) => {
    console.log('Opening comment section for:', article.title);
    // TODO: Implement a modal or comment section
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
                  <div className="source-details">
                    <div className="source">{article.source.name || 'Unknown Source'}</div>
                    <div className="time">{new Date(article.publishedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="article-content">
                <h2>{article.title}</h2>
                {article.urlToImage && <img src={article.urlToImage} alt={article.title} />}
                <p>{article.description}</p>
              </div>
              <div className="article-actions">
                <button onClick={() => toggleLike(index)} className="like-button">
                  {likedArticles[index] ? <FaThumbsUpSolid color="#187" /> : <FaThumbsUp color="#666" />} Like
                </button>
                <button onClick={() => handleComment(article)} className="comment-button">
                  <FaCommentAlt color="#187" /> Comment
                </button>
                <button onClick={() => handleShare(article.url, index)} className="share-button">
                  <FaShareAlt color="#187" /> {shared === index ? 'Copied!' : 'Share'}
                </button>
                <button onClick={(e) => handleReadMore(article, e)} className="read-more-button">
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
