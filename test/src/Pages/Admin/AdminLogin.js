import { useState, useEffect } from 'react';
import axios from 'axios';
import Logo from '../../Images/Logo.png';
import Toast from '../../Components/Toast';
import './AdminLogin.css';

// Configure axios defaults
axios.defaults.withCredentials = true;

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get('http://localhost:5000/check-admin-session');
        if (res.data.isAdmin) {
          window.location.href = '/admin/panel';
        }
      } catch (err) {
        // Not logged in, continue with login page
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const requestCode = async () => {
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/request-admin-code', { email });
      showToast('Code sent to your email');
      setStep('verify');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        showToast('Unauthorized email address', 'error');
      } else {
        showToast('Failed to send code. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code) {
      showToast('Please enter the verification code', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/verify-admin-code', { email, code });
      if (res.data.success) {
        showToast('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/admin-panel';
        }, 1500);
      } else {
        showToast('Invalid code. Please try again.', 'error');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        showToast('Invalid or expired code. Please try again.', 'error');
      } else {
        showToast('Verification failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img className="login-logo" src={Logo} alt="Company Logo" />
            <h2 className="login-title">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            className="login-logo"
            src={Logo}
            alt="Company Logo"
          />
          <h2 className="login-title">Admin Login</h2>
          <p className="login-subtitle">Please verify your identity</p>
        </div>
        
        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <div className="input-container">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Admin email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={step === 'verify'}
              />
            </div>
          </div>
          
          {step === 'verify' && (
            <div className="form-group">
              <label htmlFor="code" className="form-label">
                Verification Code
              </label>
              <div className="input-container">
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="button-container">
            {step === 'request' ? (
              <button
                onClick={requestCode}
                disabled={loading}
                className="primary-button"
              >
                {loading ? 'Sending...' : 'Request Verification Code'}
              </button>
            ) : (
              <>
                <button
                  onClick={verifyCode}
                  disabled={loading}
                  className="primary-button"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  onClick={() => setStep('request')}
                  className="secondary-button"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Toast 
        message={toastMessage}
        visible={toastVisible}
        onHide={hideToast}
        duration={3000}
        type={toastType}
      />
    </div>
  );
}