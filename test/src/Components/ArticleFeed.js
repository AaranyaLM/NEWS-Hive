import React, { useEffect, useState } from 'react';
import Articles from './Articles';

const ArticleFeed = ({ query, filter }) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/news?q=${query}&filterBy=${filter}`);
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
  }, [query, filter]);

  return <Articles articles={articles} />;
};

export default ArticleFeed;