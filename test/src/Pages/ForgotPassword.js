import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserAuth.css';
import logo from '../Images/Logo.png';
import Toast from '../Components/Toast'; 

function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('request'); // 'request', 'verification', 'reset'
    const navigate = useNavigate();
    
    // Toast state
    const [toast, setToast] = useState({
        message: '',
        visible: false
    });
    
    // Verification and reset state
    const [verificationData, setVerificationData] = useState({
        userId: null,
        verificationCode: '',
        email: ''
    });
    
    const [newPassword, setNewPassword] = useState({
        password: '',
        confirmPassword: ''
    });
    
    const showToast = (message, duration = 3000) => {
        setToast({
            message,
            visible: true
        });
        
        // Toast will auto-hide based on the component's useEffect
    };
    
    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            visible: false
        }));
    };
    
    // Handle email input change
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
    
    // Handle verification code input change
    const handleVerificationChange = (e) => {
        setVerificationData({
            ...verificationData,
            verificationCode: e.target.value
        });
    };
    
    // Handle password input change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setNewPassword({
            ...newPassword,
            [name]: value
        });
    };
    
    // Handle request password reset
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            // Set verification data
            setVerificationData({
                userId: data.userId,
                verificationCode: '',
                email: email
            });
            
            // Show verification step
            setStep('verification');
            showToast('A verification code has been sent to your email.');
            
            // Reset form
            setEmail('');
        } catch (error) {
            showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle verification form submission
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: verificationData.userId,
                    verificationCode: verificationData.verificationCode
                }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }
            
            // Move to reset password step
            setStep('reset');
            showToast('Code verified. You can now reset your password.');
            
            // Reset verification form
            setVerificationData({
                ...verificationData,
                verificationCode: ''
            });
        } catch (error) {
            showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle password reset submission
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Check if passwords match
        if (newPassword.password !== newPassword.confirmPassword) {
            showToast('Passwords do not match');
            setIsLoading(false);
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: verificationData.userId,
                    password: newPassword.password
                }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }
            
            // Show success and redirect to login after a delay
            showToast('Password reset successful! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/userauth');
            }, 2000);
        } catch (error) {
            showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle resend verification code
    const handleResendCode = async () => {
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/resend-reset-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: verificationData.email
                }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification code');
            }
            
            // Update user ID in case it changed
            setVerificationData({
                ...verificationData,
                userId: data.userId
            });
            
            // Show success message
            showToast('Verification code sent to your email.');
        } catch (error) {
            showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Go back to login handler
    const switchToLogin = () => {
        navigate('/userauth');
    };

    return (
        <div id="user-auth-container">
            <div id="blur-overlay"></div>
            <Toast 
                message={toast.message}
                visible={toast.visible}
                onHide={hideToast}
                duration={3000}
            />
            <div className="content justify-content-center align-items-center d-flex shadow-lg">
                {/* Left side form */}
                <div className="col-md-6 d-flex justify-content-center">
                    {step === 'request' && (
                        <form onSubmit={handleRequestReset}>
                            <div className="header-text mb-4">
                                <h1>Forgot Password</h1>
                            </div>
                            <p className="text-center mb-4">Enter your email address and we'll send you a verification code to reset your password.</p>
                            <div className="input-group mb-3">
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    className="form-control"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                />
                            </div>
                            
                            <div className="input-group mb-3 justify-content-center">
                                <button 
                                    type="submit" 
                                    className="btn border-white text-white w-50 fs-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending...' : 'Send Code'}
                                </button>
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <button 
                                    type="button" 
                                    className="btn btn-link"
                                    onClick={switchToLogin}
                                >
                                    Back to login
                                </button>
                            </div>
                        </form>
                    )}
                    
                    {step === 'verification' && (
                        <form onSubmit={handleVerifyCode}>
                            <div className="header-text mb-4">
                                <h1>Verify Code</h1>
                            </div>
                            <p className="text-center mb-4">Enter the verification code sent to your email.</p>
                            <div className="input-group mb-3">
                                <input 
                                    type="text" 
                                    placeholder="Verification Code" 
                                    className="form-control"
                                    value={verificationData.verificationCode}
                                    onChange={handleVerificationChange}
                                    required
                                />
                            </div>
                            
                            <div className="input-group mb-3 justify-content-center">
                                <button 
                                    type="submit" 
                                    className="btn border-white text-white w-50 fs-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </div>
                            <div className="d-flex justify-content-center">
                                <button 
                                    type="button" 
                                    className="btn btn-link"
                                    onClick={handleResendCode}
                                    disabled={isLoading}
                                >
                                    Resend verification code
                                </button>
                            </div>
                            <div className="d-flex justify-content-center mt-2">
                                <button 
                                    type="button" 
                                    className="btn btn-link"
                                    onClick={switchToLogin}
                                >
                                    Back to login
                                </button>
                            </div>
                        </form>
                    )}
                    
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword}>
                            <div className="header-text mb-4">
                                <h1>Reset Password</h1>
                            </div>
                            <p className="text-center mb-4">Enter your new password.</p>
                            <div className="input-group mb-3">
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder="New Password" 
                                    className="form-control"
                                    value={newPassword.password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="input-group mb-3">
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    placeholder="Confirm Password" 
                                    className="form-control"
                                    value={newPassword.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            
                            <div className="input-group mb-3 justify-content-center">
                                <button 
                                    type="submit" 
                                    className="btn border-white text-white w-50 fs-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <button 
                                    type="button" 
                                    className="btn btn-link"
                                    onClick={switchToLogin}
                                >
                                    Back to login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                
                {/* Right side with logo */}
                <div className="col-md-6 right-box">
                    <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{backgroundColor: '#fff', height: '100%', borderRadius: '0 40px 40px 0', padding: '40px'}}>
                        <img src={logo} alt="News Hive Logo" className="logo mb-4" />
                        <h1 className="text-black">Reset Your Password</h1>
                        <p className="text-black text-center"></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;