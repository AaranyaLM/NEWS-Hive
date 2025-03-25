import React, { useState, useEffect } from "react";
import "./Content.css";
import Navbar from '../Components/Navbar';

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

  if (!article) {
    return <p className="error">{error}</p>;
  }

  return (
    <>
      <Navbar />
      <div className="content-page">
        <div className="article-container">
          <h1 className="article-title">{article.title}</h1>
          <div className="publisher-info">
            {getFaviconUrl(article.url) && (
              <img src={getFaviconUrl(article.url)} alt="Source Logo" className="favicon" />
            )}
            <span className="publisher-name">{article.source.name || "Unknown Source"}</span>
          </div>
          <div className="time-stamp">{new Date(article.publishedAt).toLocaleString()}</div>
          {article.urlToImage && <img src={article.urlToImage} alt="Article" className="full-image" />}

          {/* Article Content */}
          <div className="article-body">
            {loading ? (
              <p className="loading">Loading content...</p>
            ) : error ? (
              <p className="error">Error: {error}</p>
            ) : (
              content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            )}
          </div>

          {/* Visit Source Button */}
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="visit-source-btn">
            Visit the Source
          </a>
        </div>
      </div>
    </>
  );
};

export default Content;
