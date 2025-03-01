import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Logo from '../Images/Logo.png';
import './Navbar.css'; 

function Navbar() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication status when component mounts
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
                navigate('/userauth'); // Redirect to login page after logout
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="navbar">
            <div className="logo">
                <Link to="/">
                    <img src={Logo} alt="Logo" />
                </Link>
            </div>
            <div className="navigation">
                <Link to="/">Home</Link>
                <Link to="/trending">Trending</Link>
            </div>
            <div className="auth-buttons">
                {isLoading ? (
                    <button disabled>Loading...</button>
                ) : user ? (
                    <div className="user-menu">
                        <span className="username">{user.username}</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                ) : (
                    <button><Link to="/userauth">Login/Sign Up</Link></button>
                )}
            </div>
        </div>
    );
}

export default Navbar;