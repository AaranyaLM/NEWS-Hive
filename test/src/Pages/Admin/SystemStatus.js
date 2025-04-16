import { useState, useEffect } from 'react';
import './SystemStatus.css';
import AdminNavbar from '../../Components/Admin/AdminNavbar';

export default function SystemStatus() {
  const [apiStatus, setApiStatus] = useState({
    status: 'checking',
    lastChecked: null,
    sources: [],
    categories: [],
    errors: null,
    rateLimitRemaining: null,
    rateLimitTotal: null,
    resetTime: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call to your backend
        const response = await fetch('/api/status/newsapi');
        const data = await response.json();
        
       // Update the state setting to be more defensive:
setApiStatus({
  status: data.status || 'ok',
  lastChecked: new Date().toLocaleString(),
  sources: Array.isArray(data.sources) ? data.sources : [],
  categories: Array.isArray(data.categories) ? data.categories : 
    ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
  errors: data.errors,
  rateLimitRemaining: data.rateLimitRemaining || 95,
  rateLimitTotal: data.rateLimitTotal || 100,
  resetTime: data.resetTime || new Date(Date.now() + 24*60*60*1000).toLocaleString()
});
      } catch (error) {
        setApiStatus({
          status: 'error',
          lastChecked: new Date().toLocaleString(),
          sources: [],
          categories: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
          errors: error.message,
          rateLimitRemaining: '?',
          rateLimitTotal: '?',
          resetTime: '?'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 300000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status) => {
    switch(status) {
      case 'ok':
        return 'status-ok';
      case 'error':
        return 'status-error';
      case 'degraded':
        return 'status-degraded';
      default:
        return 'status-checking';
    }
  };

  const getRateLimitPercentage = () => {
    if (apiStatus.rateLimitRemaining === '?' || apiStatus.rateLimitTotal === '?') {
      return 0;
    }
    return (apiStatus.rateLimitRemaining / apiStatus.rateLimitTotal) * 100;
  };
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <>
    <AdminNavbar></AdminNavbar>
    <div className="system-status-container">
     hello
    </div>
    </>
    
  );
}