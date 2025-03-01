import React, { useState } from 'react';
import './UserAuth.css';
import logo from '../Images/WhiteLogo.png'; // Import the logo

function UserAuth() {
    const [isActive, setIsActive] = useState(false);

    const switchToRegister = () => {
        setIsActive(true);
    };

    const switchToLogin = () => {
        setIsActive(false);
    };

    return (
        <div className={`content justify-content-center align-items-center d-flex shadow-lg ${isActive ? "active" : ""}`} id='content'>
            {/* Registration */}
            <div className='col-md-6 d-flex justify-content-center'>
               <form>
                    <div className="header-text mb-4">
                        <h1>Create Account</h1>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='text' placeholder='Username' className='form-control' />
                    </div>
                    <div className='input-group mb-3'>
                        <input type='email' placeholder='Email' className='form-control' />
                    </div>
                    <div className='input-group mb-3'>
                        <input type='password' placeholder='Password' className='form-control' />
                    </div>
                    
                    <div className='input-group mb-3 justify-content-center'>
                        <button type="submit" className='btn border-white text-white w-50 fs-6'>Register</button>
                    </div>
                </form> 
            </div>

            {/* Login */}
            <div className='col-md-6 right-box'>
               <form>
                    <div className="header-text mb-4">
                        <h1>Log In</h1>
                    </div>
                    <div className='input-group mb-3'>
                        <input type='email' placeholder='Email' className='form-control' />
                    </div>
                    <div className='input-group mb-3'>
                        <input type='password' placeholder='Password' className='form-control' />
                    </div>
                    <div className='input-group mb-5 d-flex justify-content-between'>
                        <div className='forgot'>
                            <small><a href='#'>Forgot Password?</a></small>
                        </div>
                    </div>
                    <div className='input-group mb-3 justify-content-center'>
                        <button type="submit" className='btn border-white text-white w-50 fs-6'>Login</button>
                    </div>
                </form> 
            </div>

            {/* Switch Panel */}
            <div className='switch-content'>
                <div className='switch'>
                    <div className='switch-panel switch-left'>
                        <img src={logo} alt="News Hive Logo" className="logo" />
                        <h1>Have an account?</h1>
                        <p>We would be happy to see you back</p>
                        <button className='hidden btn border-white text-white w-50 fs-6' id='login' onClick={switchToLogin}>Login</button>
                    </div>
                    <div className='switch-panel switch-right'>
                        <img src={logo} alt="News Hive Logo" className="logo" />
                        <h1>No account yet?</h1>
                        <p>Join News Hive, and Stay Informed!</p>
                        <button className='hidden btn border-white text-white w-50 fs-6' id='register' onClick={switchToRegister}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserAuth;
