import React, { useEffect, useState } from 'react';
import './AboutPage.css'; 

import Logo from '../Images/Logo.png'
const Terms = () => {
      const [marginLeft, setMarginLeft] = useState('150px');

  useEffect(() => {
    const handleResize = () => {
      setMarginLeft(window.innerWidth <= 768 ? '0px' : '150px');
    };

    // Set initial margin
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <>
<div className="about-container" style={{ marginLeft }}>
      {/* Hero Section */}
      <section className="about-hero">
        <img src={Logo} alt="News Hive Logo" className="about-logo" />
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

    </>
   
  );
};

export default Terms;