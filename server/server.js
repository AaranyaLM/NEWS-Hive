const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const app = express();
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('c31a65d1df3d4f49a2b9fb548e99bb0b');
const mongoose = require('mongoose');
const Interaction = require('./InteractionModel');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'newshive'
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Session store options
const sessionStore = new MySQLStore({
  checkExpirationInterval: 900000, // How frequently to check for expired sessions (15 mins)
  expiration: 86400000, // Session expiration (24 hours)
  createDatabaseTable: true // Create sessions table if it doesn't exist
}, pool);

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'aaranyalalmaskey@gmail.com', 
    pass: 'dhpw igla rzzj nhkg'
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true // Allow cookies to be sent with requests
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret', // Use a strong secret in production
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
  }
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  console.log('Session User:', req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ 
      authenticated: false, 
      message: "You need to log in to access this resource" 
    });
  }
};

// Check authentication status
app.get('/api/auth/status', (req, res) => {
  if (req.session.user) {
    res.json({ 
      authenticated: true, 
      user: { 
        id: req.session.user.id, 
        username: req.session.user.username, 
        email: req.session.user.email 
      } 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Modified register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Check if username already exists
    const [existingUsernames] = await pool.query(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );
    
    if (existingUsernames.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    
    // Insert new user (unverified)
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, verification_code, code_expiry, is_verified, created_at) VALUES (?, ?, ?, ?, ?, FALSE, NOW())',
      [username, email, hashedPassword, verificationCode, codeExpiry]
    );
    
    // Send verification email
    const mailOptions = {
      from: 'News Hive <aaranyalalmaskey@gmail.com>',
      to: email,
      subject: 'Verify Your Email - News Hive',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://i.imgur.com/n0OYGa6.png" alt="News Hive Logo" style="max-width: 120px; margin-bottom: 20px;">
          </div>
          
          <h2 style="color: #333; text-align: center;">Welcome to News Hive!</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            Thank you for signing up with <strong>News Hive</strong>. To complete your registration, please verify your email address by entering the code below:
          </p>
          
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${verificationCode}
          </div>
    
          
          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
            This code will expire in <strong>1 hour</strong>. If you did not sign up for News Hive, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #777; text-align: center;">
            Need help? Contact us at <a href="mailto:aaranyalalmaskey@gmail.com" style="color: #007bff; text-decoration: none;">support@newshive.com</a>
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// New endpoint to verify email
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;
    
    // Find user by ID
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Check if account is already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account already verified'
      });
    }
    
    // Check if verification code is correct and not expired
    if (user.verification_code !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    const now = new Date();
    const codeExpiry = new Date(user.code_expiry);
    
    if (now > codeExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired'
      });
    }
    
    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_code = NULL, code_expiry = NULL WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

// New endpoint to resend verification code
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Check if account is already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account already verified'
      });
    }
    
    // Generate new verification code
    const newVerificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    
    // Update user's verification code
    await pool.query(
      'UPDATE users SET verification_code = ?, code_expiry = ? WHERE id = ?',
      [newVerificationCode, codeExpiry, user.id]
    );
    
    // Send new verification email
    const mailOptions = {
      from: 'News Hive <aaranyalalmaskey@gmail.com>',
      to: email,
      subject: 'News Hive - New Verification Code',
      html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://i.imgur.com/n0OYGa6.png" alt="News Hive Logo" style="max-width: 120px; margin-bottom: 20px;">
          </div>
          
          <h2 style="color: #333; text-align: center;">Welcome to News Hive!</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            Thank you for signing up with <strong>News Hive</strong>. To complete your registration, please verify your email address by entering the code below:
          </p>
          
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${newVerificationCode}
          </div>
    
          
          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
            This code will expire in <strong>1 hour</strong>. If you did not sign up for News Hive, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #777; text-align: center;">
            Need help? Contact us at <a href="mailto:aaranyalalmaskey@gmail.com" style="color: #007bff; text-decoration: none;">support@newshive.com</a>
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'New verification code sent',
      userId: user.id
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when resending verification code'
    });
  }
});

//  login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    const user = users[0];
    
    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        userId: user.id,
        requiresVerification: true
      });
    }
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to logout' 
      });
    }
    
    res.clearCookie('session_cookie_name');
    res.json({ 
      success: true, 
      message: 'Logout successful' 
    });
  });
});


// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }
    
    const user = users[0];
    
    // Generate reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry
    
    // Update user's verification code
    await pool.query(
      'UPDATE users SET verification_code = ?, code_expiry = ? WHERE id = ?',
      [resetCode, codeExpiry, user.id]
    );
    
    // Send password reset email
    const mailOptions = {
      from: 'News Hive <aaranyalalmaskey@gmail.com>',
      to: email,
      subject: 'Password Reset - News Hive',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://i.imgur.com/n0OYGa6.png" alt="News Hive Logo" style="max-width: 120px; margin-bottom: 20px;">
          </div>
          
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            You requested to reset your password for <strong>News Hive</strong>. Please use the verification code below:
          </p>
          
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${resetCode}
          </div>
          
          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
            This code will expire in <strong>30 minutes</strong>. If you did not request this password reset, please ignore this email or contact support.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #777; text-align: center;">
            Need help? Contact us at <a href="mailto:aaranyalalmaskey@gmail.com" style="color: #007bff; text-decoration: none;">support@newshive.com</a>
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      userId: user.id
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// Verify reset code endpoint
app.post('/api/auth/verify-reset-code', async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;
    
    // Validate input
    if (!userId || !verificationCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and verification code are required' 
      });
    }
    
    // Find user by ID
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Check if verification code is correct and not expired
    if (user.verification_code !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    const now = new Date();
    const codeExpiry = new Date(user.code_expiry);
    
    if (now > codeExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired'
      });
    }
    
    res.json({
      success: true,
      message: 'Code verified successfully'
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during code verification'
    });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and new password are required' 
      });
    }
    
    // Find user by ID
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Check if user has a valid verification code (has gone through the reset process)
    if (!user.verification_code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password reset request'
      });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update user's password and clear verification code
    await pool.query(
      'UPDATE users SET password_hash = ?, verification_code = NULL, code_expiry = NULL WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// Resend reset code endpoint
app.post('/api/auth/resend-reset-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Find user by email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }
    
    const user = users[0];
    
    // Generate new reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry
    
    // Update user's verification code
    await pool.query(
      'UPDATE users SET verification_code = ?, code_expiry = ? WHERE id = ?',
      [resetCode, codeExpiry, user.id]
    );
    
    // Send new reset code email
    const mailOptions = {
      from: 'News Hive <aaranyalalmaskey@gmail.com>',
      to: email,
      subject: 'New Password Reset Code - News Hive',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #ffffff;">
          <div style="text-align: center;">
            <img src="https://i.imgur.com/n0OYGa6.png" alt="News Hive Logo" style="max-width: 120px; margin-bottom: 20px;">
          </div>
          
          <h2 style="color: #333; text-align: center;">New Password Reset Code</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            You requested a new code to reset your password for <strong>News Hive</strong>. Please use the verification code below:
          </p>
          
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${resetCode}
          </div>
          
          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
            This code will expire in <strong>30 minutes</strong>. If you did not request this password reset, please ignore this email or contact support.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #777; text-align: center;">
            Need help? Contact us at <a href="mailto:aaranyalalmaskey@gmail.com" style="color: #007bff; text-decoration: none;">support@newshive.com</a>
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'New password reset code sent to your email',
      userId: user.id
    });
  } catch (error) {
    console.error('Resend reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when resending reset code'
    });
  }
});
app.get('/api/user/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Fetch user details from database
    const [users] = await pool.query(
      'SELECT id, username, email, created_at, bio, last_username_change FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Format the created_at date
    const createdAt = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: createdAt,
        bio: user.bio || '',
        lastUsernameChange: user.last_username_change
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Update user profile
app.post('/api/user/update-profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { username, bio } = req.body;
    
    // Start building the update query and parameters
    let updateFields = [];
    let updateParams = [];
    let usernameChanged = false;
    let oldUsername = '';
    
    // Only include bio in update if it's provided
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateParams.push(bio);
    }
    
    // Handle username update with restrictions
    if (username !== undefined) {
      // Check if username is different from current username
      const [currentUser] = await pool.query(
        'SELECT username, last_username_change FROM users WHERE id = ?',
        [userId]
      );
      
      oldUsername = currentUser[0].username;
      
      if (currentUser[0].username !== username) {
        usernameChanged = true;
        
        // Check if the username already exists
        const [existingUsers] = await pool.query(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, userId]
        );
        
        if (existingUsers.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Username already taken'
          });
        }
        
        // Check 7-day restriction
        if (currentUser[0].last_username_change) {
          const lastChange = new Date(currentUser[0].last_username_change);
          const now = new Date();
          const daysSinceLastChange = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastChange < 7) {
            return res.status(403).json({
              success: false,
              message: 'You can only change your username once every 7 days'
            });
          }
        }
        
        // Add username to update fields
        updateFields.push('username = ?');
        updateParams.push(username);
        
        // Update last_username_change date
        updateFields.push('last_username_change = NOW()');
      }
    }
    
    // If nothing to update
    if (updateFields.length === 0) {
      return res.json({
        success: true,
        message: 'No changes to save'
      });
    }
    
    // Perform the update
    updateParams.push(userId);
    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );
    
    // Update session data if username was changed
    if (usernameChanged) {
      req.session.user.username = username;
      
      // Update all comments in MongoDB with the new username
      await updateUsernameInComments(userId.toString(), oldUsername, username);
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Function to update username in all comments
async function updateUsernameInComments(userId, oldUsername, newUsername) {
  try {
    // Find all interactions by this user that have comments
    const userInteractions = await Interaction.find({ 
      userId: userId,
      'comments.0': { $exists: true } // Has at least one comment
    });
    
    console.log(`Updating username from ${oldUsername} to ${newUsername} for user ${userId} in ${userInteractions.length} interactions`);
    
    // Update the username in all comments for this user's interactions
    for (const interaction of userInteractions) {
      // Update each comment that has the old username
      for (let i = 0; i < interaction.comments.length; i++) {
        if (interaction.comments[i].username === oldUsername) {
          interaction.comments[i].username = newUsername;
        }
      }
      await interaction.save();
    }
    
    // Also update comments made by this user on other articles
    await Interaction.updateMany(
      { 'comments.username': oldUsername },
      { $set: { 'comments.$[elem].username': newUsername } },
      { arrayFilters: [{ 'elem.username': oldUsername }] }
    );
    
    console.log('Username updated in all comments successfully');
  } catch (error) {
    console.error('Error updating username in comments:', error);
    throw error;
  }
}

// Change password
app.post('/api/user/change-password', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Get current user data
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});





// User interactions
mongoose.connect('mongodb://localhost:27017/news_hive', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Like an article
app.post('/api/like', isAuthenticated, async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.session.user.id;
    
    // Find the existing interaction
    const existingInteraction = await Interaction.findOne({ articleId, userId });
    
    // Toggle the liked state - if it exists and is liked, set to false; otherwise set to true
    const newLikedState = existingInteraction ? !existingInteraction.liked : true;
    
    const interaction = await Interaction.findOneAndUpdate(
      { articleId, userId },
      { liked: newLikedState },
      { upsert: true, new: true }
    );
    
    res.json(interaction);
  } catch (error) {
    console.error('Error toggling like status:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

app.post('/api/user-interactions', isAuthenticated, async (req, res) => {
  try {
    const { articleIds } = req.body;
    const userId = req.session.user.id;
    
    console.log('Fetching interactions for user:', userId, 'articles:', articleIds);
    
    // Find all interactions for this user and the provided article IDs
    const interactions = await Interaction.find({
      userId: userId,
      articleId: { $in: articleIds }
    });
    
    console.log('Found interactions:', interactions.length);
    
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    res.status(500).json({ error: 'Failed to fetch user interactions' });
  }
});
app.get('/api/comments/:articleId', isAuthenticated, async (req, res) => {
  try {
    // Don't decode the URL parameter - match exactly what's in the database
    const articleId = req.params.articleId;
    console.log('Raw articleId from request:', articleId);
    
    // Get ALL interactions from the database for debugging
    const allInteractions = await Interaction.find({}).lean();
    console.log('All articleIds in database:', 
      allInteractions.map(i => ({ id: i.articleId, hasComments: i.comments?.length > 0 })));
    
    // Find interactions for this exact articleId
    const interactions = await Interaction.find({ articleId }).lean();
    console.log('Found interactions for articleId:', interactions.length);
    
    // Extract all comments
    let allComments = [];
    for (const int of interactions) {
      if (int.comments && int.comments.length > 0) {
        for (const comment of int.comments) {
          allComments.push({
            text: comment.text,
            timestamp: comment.timestamp,
            username: comment.username || 'Anonymous User'
          });
        }
      }
    }
    
    // Sort by timestamp
    allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    console.log('Final comments count:', allComments.length);
    
    res.json({ comments: allComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});
  app.post('/api/comment', isAuthenticated, async (req, res) => {
    try {
      const { articleId, text } = req.body;
      const userId = req.session.user.id;
      const username = req.session.user.username;
      
      const interaction = await Interaction.findOneAndUpdate(
        { articleId, userId }, // Add userId to the query to get the user's specific interaction
        { 
          $push: { 
            comments: { 
              text, 
              timestamp: new Date(), 
              username 
            } 
          } 
        },
        { upsert: true, new: true }
      );
      
      res.json(interaction);
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).json({ error: 'Failed to post comment' });
    }
  });

  app.get('/api/debug/all-comments', async (req, res) => {
    try {
      // Get ALL interactions that have comments
      const interactions = await Interaction.find({
        'comments.0': { $exists: true }
      }).lean();
      
      // Create a response with detailed information
      const debug = {
        totalInteractionsWithComments: interactions.length,
        interactionDetails: interactions.map(int => ({
          _id: int._id,
          articleId: int.articleId,
          userId: int.userId,
          commentCount: int.comments ? int.comments.length : 0,
          firstCommentText: int.comments && int.comments.length > 0 ? 
            int.comments[0].text : 'No comments'
        })),
        allComments: []
      };
      
      // Extract all comments
      for (const int of interactions) {
        if (int.comments && int.comments.length > 0) {
          for (const comment of int.comments) {
            debug.allComments.push({
              interactionId: int._id,
              articleId: int.articleId,
              commentText: comment.text,
              timestamp: comment.timestamp,
              username: comment.username || 'Unknown'
            });
          }
        }
      }
      
      res.json(debug);
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      res.status(500).json({ error: 'Debug endpoint failed' });
    }
  });
//user profile comments
app.get('/api/user/comments', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    // Find all interactions that have comments from this user
    const interactions = await Interaction.find({
      userId: userId,
      'comments.0': { $exists: true } // Only get interactions with at least one comment
    }).lean();
    
    // Create a lookup object for article data
    const articleDataMap = {};
    
    // Extract articleIds to find corresponding article info
    const articleIds = interactions.map(int => int.articleId);
    
    // First try to find article info in the ArticleInfo collection
    for (const articleId of articleIds) {
      try {
        // Try to find article info in your collection first
        const articleInfo = await ArticleInfo.findOne({ articleId }).lean();
        
        if (articleInfo) {
          // Use data from your database if available
          articleDataMap[articleId] = {
            title: articleInfo.title,
            url: decodeURIComponent(articleId), // Decode URL for display
            source: { name: articleInfo.source || extractSourceFromUrl(decodeURIComponent(articleId)) },
            publishedAt: articleInfo.publishedAt || new Date().toISOString(),
            urlToImage: articleInfo.imageUrl
          };
        } else {
          // Fall back to extracting info from the URL
          const decodedUrl = decodeURIComponent(articleId);
          const sourceName = extractSourceFromUrl(decodedUrl);
          const title = extractTitleFromUrl(decodedUrl);
          
          articleDataMap[articleId] = {
            title: title,
            url: decodedUrl,
            source: { name: sourceName },
            publishedAt: new Date().toISOString()
          };
        }
      } catch (err) {
        console.error(`Error processing article ${articleId}:`, err);
        // Provide fallback data
        const decodedUrl = decodeURIComponent(articleId);
        articleDataMap[articleId] = {
          title: extractTitleFromUrl(decodedUrl) || 'News Article',
          url: decodedUrl,
          source: { name: extractSourceFromUrl(decodedUrl) || 'External Source' },
          publishedAt: new Date().toISOString()
        };
      }
    }
    
    // Helper function to extract source from URL
    function extractSourceFromUrl(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
      } catch (e) {
        return 'Unknown Source';
      }
    }
    
    // Helper function to extract a title from URL
    function extractTitleFromUrl(url) {
      try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathSegments.length > 0) {
          const lastSegment = pathSegments[pathSegments.length - 1]
            .replace(/-/g, ' ')
            .replace(/\.(html|php|asp|aspx)$/, '')
            .replace(/\d+$/, ''); // Remove trailing numbers
            
          if (lastSegment.length > 3) {
            return lastSegment
              .split(/[-_]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        }
        
        // If we can't extract from path, try the hostname
        return urlObj.hostname.replace('www.', '') + ' Article';
      } catch (e) {
        return 'News Article';
      }
    }
    
    // Extract all comments with article data
    let userComments = [];
    
    for (const int of interactions) {
      if (int.comments && int.comments.length > 0) {
        const articleData = articleDataMap[int.articleId];
        
        for (const comment of int.comments) {
          userComments.push({
            articleId: int.articleId,
            articleTitle: articleData.title,
            articleData: articleData,
            text: comment.text,
            timestamp: comment.timestamp,
            username: comment.username || req.session.user.username
          });
        }
      }
    }
    
    // Sort by timestamp - most recent first
    userComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ 
      success: true,
      comments: userComments
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user comments',
      message: error.message
    });
  }
});

app.delete('/api/user/comments/delete', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { articleId, timestamp } = req.body;
    
    if (!articleId || !timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Missing required data (articleId or timestamp)'
      });
    }
    
    // Find the interaction for this user and article
    const interaction = await Interaction.findOne({
      userId: userId,
      articleId: articleId
    });
    
    if (!interaction) {
      return res.status(404).json({
        success: false,
        error: 'Interaction not found'
      });
    }
    
    // Check if the interaction has comments
    if (!interaction.comments || interaction.comments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No comments found for this article'
      });
    }
    
    // Create a new Date object to match with the stored timestamp
    const commentDate = new Date(timestamp);
    
    // Find the index of the comment with matching timestamp
    const commentIndex = interaction.comments.findIndex(comment => {
      const storedDate = new Date(comment.timestamp);
      return storedDate.getTime() === commentDate.getTime();
    });
    
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    
    // Remove the comment from the array
    interaction.comments.splice(commentIndex, 1);
    
    // Save the updated interaction
    await interaction.save();
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
      message: error.message
    });
  }
});

// Track Read More Clicks
app.post('/api/read-more', isAuthenticated, async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.session.user.id;
    
    const interaction = await Interaction.findOneAndUpdate(
      { articleId, userId },
      { readMore: true },
      { upsert: true, new: true }
    );
    
    res.json(interaction);
  } catch (error) {
    console.error('Error tracking read more:', error);
    res.status(500).json({ error: 'Failed to track read more' });
  }
});
//Share API endpoint
app.post('/api/share', isAuthenticated, async (req, res) => {
  try {
    const { articleId } = req.body;
    const userId = req.session.user.id;
    
    // Find the existing interaction or create a new one
    const interaction = await Interaction.findOneAndUpdate(
      { articleId, userId },
      // Increment the shares field by 1
      { $inc: { shares: 1 } },
      { upsert: true, new: true }
    );
    
    res.json(interaction);
  } catch (error) {
    console.error('Error updating share count:', error);
    res.status(500).json({ error: 'Failed to update share count' });
  }
});
// For the feeds
// Protected API routes
app.get('/api/news', isAuthenticated, (req, res) => {
  console.log('Session User:', req.session.user);
  
  let query = req.query.q;
  if (!query || query.trim() === '') {
    query = 'bitcoin'; // Default keyword
  }

  const filterBy = req.query.filterBy || null;
  const sortBy = req.query.sortBy || 'relevancy';

  newsapi.v2
    .everything({
      q: query,
      sortBy: sortBy,
    })
    .then(response => {
      let filteredArticles = response.articles;

      if (filterBy === 'source') {
        filteredArticles = filteredArticles.filter(article =>
          article.source.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      res.json(filteredArticles);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching news');
    });
});

app.get('/api/trending', isAuthenticated, (req, res) => {
  const { q, country, category, sortBy } = req.query;

  const options = {
    country: country ? country.toLowerCase() : 'us'
  };

  if (category && category !== '') options.category = category;
  if (q && q !== '') options.q = q;

  console.log('API Request Options:', options);
  newsapi.v2
    .topHeadlines(options)
    .then(response => {
      console.log('API Response Status:', response.status);
      res.json(response.articles);
    })
    .catch(err => {
      console.error('News API Error:', err);
      res.status(500).send('Error fetching trending news');
    });
});

// Server start confirmation
app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});