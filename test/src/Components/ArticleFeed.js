import React, { useEffect, useState } from 'react';
import Articles from './Articles';

const ArticleFeed = ({ query, filter }) => {
  const [articles, setArticles] = useState([]);

  const fetchNews = (keyword, filterBy) => {
    fetch(`http://localhost:5000/api/news?q=${keyword}&filterBy=${filterBy}`)
      .then((response) => response.json())
      .then((data) => setArticles(data))
      .catch((err) => console.error('Error fetching news:', err));
  };

  useEffect(() => {
    fetchNews(query, filter);
  }, [query, filter]);

  return <Articles articles={articles} />;
};

export default ArticleFeed;
