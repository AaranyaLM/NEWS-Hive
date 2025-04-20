import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DownloadedArticles from '../Components/DownloadedArticles';
import { FaUser } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import './SavedArticlePage.css'; 
import Footer from '../Components/Footer';

function Downloads() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        const verifyUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setUser(data.user);
                } else {
                    // Redirect to login if not authenticated
                    navigate('/userauth');
                    return;
                }
            } catch (error) {
                console.error('Failed to verify user:', error);
                navigate('/userauth');
                return;
            } finally {
                setIsLoading(false);
            }
        };
        
        verifyUser();
    }, [navigate]);

    const goToProfile = () => {
        navigate('/profile');
    };

    if (isLoading) {
        return (
            <div className="saved-article-page">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <>
          <div className="page-container">
            <Navbar />
            
            <div className="saved-article-page">
                <div className="saved-article-header">
                    <div className="header-left">
                        <h1>Downloaded Articles History</h1>
                    </div>
                    
                    <div className="header-right">
                        <button className="profile-button" onClick={goToProfile}>
                            <FaUser />
                            <span>{user?.username}</span>
                        </button>
                    </div>
                </div>

                <div className="saved-article-content">
                    <p className="saved-articles-description">
                        Your downloaded articles are listed below. Download again or remove them as needed.
                    </p>
                    
                    <DownloadedArticles />
                </div>
            </div>
        </div>
        <Footer></Footer>
        </>
      
    );
}

export default Downloads;