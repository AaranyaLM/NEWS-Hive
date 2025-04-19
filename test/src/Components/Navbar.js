import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Images/Logo.png';
import './Navbar.css';

function Navbar() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
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

    // Close mobile menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const initiateLogout = () => {
        setShowLogoutConfirm(true);
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const confirmLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                setUser(null);
                setShowLogoutConfirm(false);
                navigate('/userauth');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Helper function to determine if a link is active
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
            {/* Desktop Sidebar Navigation */}
            <div className="page-container">
                <nav className="sidebar-navbar desktop-only">
                    <div className="sidebar-container">
                        <Link to="/" className="sidebar-logo">
                            <img src={Logo} alt="Logo" />
                        </Link>
                        
                        <div className="sidebar-links">
                            <Link to="/" className={`sidebar-link ${isActive('/')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                                <span>Home</span>
                            </Link>
                            <Link to="/trending" className={`sidebar-link ${isActive('/trending')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                    <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                                <span>Trending</span>
                            </Link>
                            {user && (
                                <Link to="/saved" className={`sidebar-link ${isActive('/saved')}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                    <span>Saved</span>
                                </Link>
                            )}
                            {user && (
    <Link to="/downloads" className={`sidebar-link ${isActive('/downloads')}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Downloads</span>
    </Link>
)}
                        </div>
                        
                        <div className="sidebar-auth">
                            {isLoading ? (
                                <span className="loading-text">Loading...</span>
                            ) : user ? (
                                <div className="user-profile">
                                    <Link to="/profile" className="sidebar-link">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <span className="username">{user.username}</span>
                                    </Link>
                                    <button onClick={initiateLogout} className="sidebar-link logout-button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <Link to="/userauth" className="sidebar-link login-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                        <polyline points="10 17 15 12 10 7"></polyline>
                                        <line x1="15" y1="12" x2="3" y2="12"></line>
                                    </svg>
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
                
                {/* Mobile Horizontal Navbar - Original Design */}
                <nav className="slim-navbar mobile-only">
                    <div className="navbar-container">
                        <Link to="/" className="navbar-logo">
                            <img src={Logo} alt="Logo" />
                        </Link>
                        
                        <button 
                            className="mobile-menu-button" 
                            onClick={toggleMenu}
                            aria-label="Toggle navigation menu"
                        >
                            <svg 
                                className="mobile-menu-icon" 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                {menuOpen ? (
                                    // X icon when menu is open
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </>
                                ) : (
                                    // Hamburger icon when menu is closed
                                    <>
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </>
                                )}
                            </svg>
                        </button>
                        
                        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                            <Link to="/" className={isActive('/')}>Home</Link>
                            <Link to="/trending" className={isActive('/trending')}>Trending</Link>
                            {user && <Link to="/saved" className={isActive('/saved')}>Saved</Link>}
                            {user && <Link to="/downloads" className={isActive('/downloads')}>Downloads</Link>}
                        </div>
                        
                        <div className="navbar-auth">
                            {isLoading ? (
                                <span className="loading-text">Loading...</span>
                            ) : user ? (
                                <div className="user-profile">
                                    <div className="user-icon">
                                        <Link to="/profile" className="username">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </Link>
                                    </div>
                                    <Link to="/profile" className="username">{user.username}</Link>
                                    <button onClick={initiateLogout} className="logout-button">
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
            </div>

            {/* Logout Confirmation Popup */}
            {showLogoutConfirm && (
                <div className="logout-popup-overlay">
                    <div className="logout-popup">
                        <div className="logout-popup-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9"/>
                            </svg>
                            <h3>Confirm Logout</h3>
                        </div>
                        <p>Are you sure you want to log out?</p>
                        <div className="logout-popup-buttons">
                            <button onClick={cancelLogout} className="cancel-button">
                                Cancel
                            </button>
                            <button onClick={confirmLogout} className="confirm-button">
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;