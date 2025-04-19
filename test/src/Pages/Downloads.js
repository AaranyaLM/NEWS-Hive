import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaFileDownload, FaArrowLeft } from 'react-icons/fa';
import Toast from '../Components/Toast';
import './Downloads.css';

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    message: '',
    visible: false,
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({
      message,
      visible: true,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true);
        
        // Fetch all downloaded articles for this user
        const response = await axios.get('/api/user/downloaded-articles');
        
        if (response.data.success) {
          setDownloads(response.data.articles);
        } else {
          setDownloads([]);
          throw new Error(response.data.error || 'Could not fetch downloads');
        }
      } catch (err) {
        console.error('Error fetching downloads:', err);
        setError('Failed to load your downloaded articles. Please try again later.');
        showToast('Could not load your downloads', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const handleDownload = async (article) => {
    try {
      // Prepare the data for the download request
      const downloadData = {
        articleId: article.url,
        article: article,
        userId: localStorage.getItem('userId')
      };

      // Show toast before starting download
      showToast('Preparing download...');

      // Make request to download endpoint
      const response = await axios.post('/api/download-article', downloadData, {
        responseType: 'blob' // Important for receiving binary data
      });

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${article.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Download started!');
    } catch (err) {
      console.error('Error downloading article:', err);
      showToast('Failed to download article', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="downloads-page">
      <Toast 
        message={toast.message} 
        visible={toast.visible} 
        onHide={hideToast} 
        type={toast.type} 
      />

      <div className="back-link">
        <Link to="/profile" className="back-button">
          <FaArrowLeft className="back-icon" />
          Back to Profile
        </Link>
      </div>

      <h1 className="page-title">My Downloads</h1>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : downloads.length === 0 ? (
        <div className="no-content">
          <h3>No Downloads Yet</h3>
          <p>You haven't downloaded any articles yet.</p>
          <Link to="/" className="browse-button">
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="downloads-grid">
          {downloads.map((article, index) => (
            <div key={index} className="article-card">
              <div className="article-image">
                {article.urlToImage ? (
                  <img src={article.urlToImage} alt={article.title} />
                ) : (
                  <div className="no-image">No image</div>
                )}
              </div>

              <div className="article-content">
                <h2 className="article-title">{article.title || 'Unnamed Article'}</h2>
                
                <p className="article-meta">
                  {article.source?.name || 'Unknown source'} • {formatDate(article.publishedAt)}
                </p>
                
                <p className="article-description">{article.description || 'No description available'}</p>
              </div>

              <div className="article-actions">
                <button
                  onClick={() => handleDownload(article)}
                  className="download-button"
                >
                  <FaFileDownload className="download-icon" />
                  Download Again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Downloads;