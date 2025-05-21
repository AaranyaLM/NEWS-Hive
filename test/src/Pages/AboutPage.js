import React from 'react';
import './AboutPage.css'; 
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import Logo from '../Images/Logo.png'
const AboutPage = () => {
  return (
    
    <>
    <Navbar></Navbar> 
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <img src={Logo} alt="News Hive Logo" className="about-logo" />
        <h1>About News Hive: Stay Informed</h1>
      </section>

      {/* Platform Overview */}
      <section className="about-section">
        <h2>Our Platform</h2>
        <p>
          News Hive is a dynamic news aggregation platform that curates articles from various sources 
          using NewsAPI.org. We present these articles in a social media-like feed, 
          enhancing user engagement through personalized recommendations.
        </p>
        <p>
          The platform leverages AI and machine learning to tailor content to individual preferences 
          based on user interactions such as likes, shares, and reading history. Our front end is built 
          using React, while the back end is managed with Express.js. We also integrate web scraping 
          in Python to fetch full articles when they are freely available but not included in the API response.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          In today's modern digital news landscape, information is fragmented, with users often struggling to 
          find reliable and relevant news efficiently. Traditional news platforms lack personalization, 
          forcing users to sift through vast amounts of content.
        </p>
        <p>
          News Hive addresses these challenges by offering an aggregated news feed that consolidates news 
          from multiple sources in a unified interface. Our AI-driven personalization ensures that you 
          receive a curated feed based on your behavior, making news discovery more intuitive.
        </p>
      </section>

      {/* Features Section */}
      <section className="about-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Unified News Feed</h3>
            <p>Access news from multiple sources in one seamless interface, saving you time and effort.</p>
          </div>
          <div className="feature-card">
            <h3>AI-Powered Personalization</h3>
            <p>Receive news tailored to your interests based on your reading history and interactions.</p>
          </div>
          <div className="feature-card">
            <h3>Interactive Features</h3>
            <p>Engage with content through likes, comments, and shares to enhance your experience.</p>
          </div>
          <div className="feature-card">
            <h3>Full Article Access</h3>
            <p>Read full articles within our platform when they're freely available.</p>
          </div>
        </div>
      </section>

      {/* Aims & Objectives */}
      <section className="about-section">
        <h2>Our Aims</h2>
        <ul className="aims-list">
          <li>
            To create an innovative platform that consolidates news from diverse sources, 
            integrating advanced technologies such as machine learning for better user personalization.
          </li>
          <li>
            To promote awareness of current affairs by offering a personalized and engaging 
            news-reading experience.
          </li>
          <li>
            To foster a sense of community by encouraging users to share, discuss, 
            and debate news topics.
          </li>
        </ul>

        <h2>Our Objectives</h2>
        <ul className="objectives-list">
          <li>
            <strong>Enhance Accessibility:</strong> Develop a platform that provides a seamless 
            experience for accessing news from various outlets in one place.
          </li>
          <li>
            <strong>Leverage Technology:</strong> Utilize machine learning algorithms to deliver 
            personalized news feeds based on user preferences and activity.
          </li>
          <li>
            <strong>Encourage Engagement:</strong> Implement features for interaction with other 
            people via comments to make the platform more engaging.
          </li>
          <li>
            <strong>Foster Trust and Credibility:</strong> Aggregate news from reliable sources 
            and provide a transparent system for presenting information.
          </li>
        </ul>
      </section>

      {/* Terms and Conditions */}
      <section className="about-section terms-section">
        <h2>Terms and Conditions</h2>
        <div className="terms-content">
          <p>
            <strong>User Agreement:</strong> By accessing and using News Hive, you agree to the 
            following terms and conditions. Please read them carefully.
          </p>
          
          <h3>Data Collection and Privacy</h3>
          <p>
            <span className="highlight">By using this site, you are explicitly allowing our system to track your activity.</span> 
            This includes, but is not limited to, your reading history, likes, shares, comments, and general 
            navigation patterns within our platform.
          </p>
          <p>
            We collect this data primarily to enhance your user experience by providing personalized content 
            recommendations. Our AI and machine learning systems analyze your interactions to better understand 
            your preferences and interests.
          </p>
          
          <h3>Data Security</h3>
          <p>
            <span className="highlight">Your information is secure and is not being sent to any third party.</span> 
            News Hive takes data security seriously and implements appropriate measures to protect your 
            information from unauthorized access, alteration, disclosure, or destruction.
          </p>
          <p>
            We do not sell, trade, or otherwise transfer your personally identifiable information to 
            external parties. Any data collected is strictly used for improving our service and your 
            experience on our platform.
          </p>
          
          <h3>Content Usage</h3>
          <p>
            News Hive aggregates content from various sources. While we strive to provide accurate and 
            reliable information, we do not claim ownership of the news content displayed on our platform.
          </p>
          <p>
            Users are responsible for their interactions with the content, including comments and shares. 
            News Hive reserves the right to moderate user-generated content to maintain community standards.
          </p>
          
          <h3>Changes to Terms</h3>
          <p>
            News Hive reserves the right to modify these terms at any time. We will notify users of any 
            significant changes through appropriate channels. Continued use of our platform after changes 
            constitutes acceptance of the updated terms.
          </p>
        </div>
      </section>
    </div>
    <Footer></Footer>
    </>
   
  );
};

export default AboutPage;