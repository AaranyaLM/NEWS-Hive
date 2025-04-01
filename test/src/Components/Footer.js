import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* <img src="../Images/Logo.png" alt="News Hive Logo" className="footer-logo" /> */}
          
          <nav className="footer-nav">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/trending" className="footer-link">Trending</Link>
            <Link to="/categories" className="footer-link">Categories</Link>
            <Link to="/about" className="footer-link">About</Link>
          </nav>

          <div className="footer-socials">
            <a href="https://www.facebook.com/aaranya.lm" className="social-link" target="_blank"><FaFacebookF /></a>
            <a href="https://www.instagram.com/aaranya_lm/" className="social-link" target="_blank"><FaInstagram /></a>
            <a href="https://www.linkedin.com/in/aaranya-lm-b1100b218/" className="social-link" target="_blank"><FaLinkedinIn /></a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-text">&copy; {new Date().getFullYear()} News Hive- Stay Informed</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;