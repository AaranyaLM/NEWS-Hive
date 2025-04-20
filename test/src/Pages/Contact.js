import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer'
import Toast from '../Components/Toast'; // Import the Toast component

function Contact() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      visible: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // If user is not logged in, redirect to login
      if (!user) {
        navigate('/userauth', { state: { redirectAfterLogin: '/contact' } });
        return;
      }
      
      // Show submitting toast
      showToast('Sending your message...', 'info');
      
      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          userId: user.id
        })
      });
      
      if (response.ok) {
        // Clear form
        setFormData({
          subject: '',
          message: '',
          priority: 'normal'
        });
        
        // Show success toast
        showToast('Your message has been sent successfully! We\'ll get back to you soon.', 'success');
      } else {
        // Show error toast
        showToast('There was an error sending your message. Please try again later.', 'error');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showToast('There was an error sending your message. Please try again later.', 'error');
    }
  };

  return (
    <>
      <Navbar />
    <div className="contact-page">
     
      <Toast 
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
        duration={5000}
        type={toast.type}
      />
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Have a question or feedback? We'd love to hear from you!</p>
        </div>
        
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            {!user && (
              <div className="login-notice">
                <p>Please <a href="/userauth">log in</a> to submit a message.</p>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={!user}
                placeholder="What's this about?"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={!user}
              >
                <option value="low">Low - General question</option>
                <option value="normal">Normal - Feature request or feedback</option>
                <option value="high">High - Problem with the service</option>
                <option value="urgent">Urgent - Security or critical issue</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={!user}
                placeholder="Please describe your issue or question in detail..."
                rows={8}
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!user || toast.visible && toast.message === 'Sending your message...'}
            >
              {toast.visible && toast.message === 'Sending your message...' ? 'Sending...' : 'Send Message'}
            </button>
            
            <div className="contact-alternatives">
              <h3>Other ways to reach us:</h3>
              <div className="contact-options">
                <div className="contact-option">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Email: aaranyalmaskey@gmail.com</span>
                </div>
                <div className="contact-option">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Location: HCK, Naxal</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      
    </div>
    <Footer></Footer></>
  
  );
}

export default Contact;