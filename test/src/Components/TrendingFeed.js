import React, { useEffect, useState } from 'react';
import Articles from './Articles';

const TrendingFeed = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/trending')
      .then(response => response.json())
      .then(data => setArticles(data))
      .catch(err => console.error('Error fetching trending news:', err));
  }, []);

  return <Articles articles={articles} />;
};

export default TrendingFeed;
