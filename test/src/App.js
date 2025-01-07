import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterBy, setFilterBy] = useState(''); // State for filter type

  const fetchNews = (keyword) => {
    fetch(`http://localhost:5000/api/news?q=${keyword}&filterBy=${filterBy}`)
      .then((response) => response.json())
      .then((data) => setArticles(data))
      .catch((err) => console.error('Error fetching news:', err));
  };

  useEffect(() => {
    fetchNews('bitcoin'); // Default keyword
  }, []);

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      fetchNews(searchKeyword);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="App">
      <h1>News Feed Testing</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search news..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
          <option value="">No Filter</option>
          <option value="source">Source</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>
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
    </div>
  );
}

export default App;
