import React, { useEffect, useState } from 'react';
import Articles from './Articles';

const TrendingFeed = ({ search, locale, category, sortBy }) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const queryParams = new URLSearchParams({
          q: search,
          country: locale,
          category: category,
          sortBy: sortBy,
        }).toString();

        const response = await fetch(`http://localhost:5000/api/trending?${queryParams}`);
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error('Error fetching trending news:', err);
      }
    };

    fetchTrending();
  }, [search, locale, category, sortBy]);

  return <Articles articles={articles} />;
};

export default TrendingFeed;
