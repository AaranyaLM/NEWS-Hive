import React, { useEffect, useState, useCallback } from 'react';
import Articles from './Articles';

const ArticleFeed = ({ query, filter, sort }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use useCallback to prevent unnecessary re-creation of function
  const fetchNews = useCallback(async () => {
    // Don't set loading state for empty queries to avoid flashing loading state
    // when component first mounts
    const showLoading = query !== '';
    
    if (showLoading) setLoading(true);
    setError(null);
    
    console.log('ArticleFeed: Fetching news with params:', { query, filter, sort });
    
    try {
      const params = new URLSearchParams();
      
      // Send empty string for query to trigger backend to use predicted terms
      params.append('q', query);
      if (filter) params.append('filterBy', filter);
      if (sort) params.append('sortBy', sort);
      
      const url = `http://localhost:5000/api/news?${params}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      // Check for non-OK responses first
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        
        try {
          // Try to get more detailed error info
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse JSON, try getting text
          const errorText = await response.text().catch(() => null);
          if (errorText) {
            errorMessage = `Server error: ${errorText.substring(0, 100)}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Get the response as text first
      const responseText = await response.text();
      
      // Check if the response is empty
      if (!responseText || responseText.trim() === '') {
        throw new Error('Server returned an empty response');
      }
      
      // Try to parse the text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.log('Response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response from server`);
      }
      
      // Check if data is an array before setting it
      if (Array.isArray(data)) {
        console.log(`Received ${data.length} articles`);
        setArticles(data);
      } else if (data && data.error) {
        // Server returned an error object
        throw new Error(data.error);
      } else {
        // Unknown format
        console.error('Unexpected response format:', data);
        throw new Error('Server returned an unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message || 'Failed to fetch news articles');
      setArticles([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [query, filter, sort]);

  useEffect(() => {
    // Always fetch on mount to get default articles
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="article-feed">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading articles...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <h3>Error loading articles</h3>
          <p>{error}</p>
          <button onClick={fetchNews} className="retry-button">
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && articles.length === 0 && (
        <div className="no-results">
          <h3>No articles found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      )}
      
      {!loading && !error && articles.length > 0 && (
        <Articles articles={articles} />
      )}
    </div>
  );
};

export default ArticleFeed;