import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Logo from '../Images/Logo.png';
import './Navbar.css'; 

function Navbar() {
    return (
        <div className="navbar">
            <div className="logo">
                <Link to="/"> {/* Clicking logo also goes to Home */}
                    <img src={Logo} alt="Logo" />
                </Link>
            </div>
            <div className="navigation">
                <Link to="/">Home</Link>
                <Link to="/trending">Trending</Link>
            </div>
            <div className="auth-buttons">
                <button className="login-btn">Login</button>
                <button className="signup-btn">Sign Up</button>
            </div>
        </div>
    );
}

export default Navbar;
