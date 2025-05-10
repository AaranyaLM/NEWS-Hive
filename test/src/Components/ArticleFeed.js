import React, { useEffect, useState } from 'react';
import Articles from './Articles';

const ArticleFeed = ({ query, filter, sort }) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          filterBy: filter,
          sortBy: sort
        });
        const response = await fetch(`http://localhost:5000/api/news?${params}`,{
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
  }, [query, filter, sort]);

  return <Articles articles={articles} />;
};

export default ArticleFeed;