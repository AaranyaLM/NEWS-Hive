import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SavedArticles from '../Components/SavedArticles';
import { FaArrowLeft, FaUser } from 'react-icons/fa';
import Navbar from '../Components/Navbar'; // Import the Navbar component
import './SavedArticlePage.css';
import Footer from '../Components/Footer';

function SavedArticlePage() {
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

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

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
            <Navbar /> {/* Include the Navbar component */}
            
            <div className="saved-article-page">
                <div className="saved-article-header">
                    <div className="header-left">
                        {/* <button className="back-button" onClick={handleBack}>
                            <FaArrowLeft />
                        </button> */}
                        <h1>Saved Articles</h1>
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
                        All your bookmarked articles in one place. Read, share, or remove them at any time.
                    </p>
                    
                    <SavedArticles />
                </div>
            </div>
        </div>
        <Footer></Footer>
        </>
       
    );
}

export default SavedArticlePage;