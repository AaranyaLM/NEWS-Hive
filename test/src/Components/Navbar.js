import React from 'react';
import Logo from '../Images/Logo.png';
import './Navbar.css'; 

function Navbar(props) {
    return (
        <div className="navbar">
            <div className="logo">
                <img src={Logo} alt="Logo" />
            </div>
            <div className="navigation">
                <a href=''>Home</a>
                <a href=''>Trending</a>
                <a href=''>Home</a>
            </div>
            <div className="auth-buttons">
                <button className="login-btn">Login</button>
                <button className="signup-btn">Sign Up</button>
            </div>
        </div>
    );
}

export default Navbar;
