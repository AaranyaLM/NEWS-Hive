import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Images/Logo.png';
import './Navbar.css'; 

function Navbar() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/status', {
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.authenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to check auth status:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuthStatus();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                setUser(null);
                navigate('/userauth');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="slim-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={Logo} alt="Logo" />
                </Link>
                
                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <Link to="/trending">Trending</Link>
                </div>
                
                <div className="navbar-auth">
                    {isLoading ? (
                        <span className="loading-text">Loading...</span>
                    ) : user ? (
                        <div className="user-profile">
                            <span className="username">{user.username}</span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/userauth" className="login-button">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;