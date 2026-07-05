require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { sendOtpEmail } = require('./src/emailService');
const {
  generateOtp,
  hashOtp,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken
} = require('./src/authService');

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'secret123';

// Middleware to authenticate Access Tokens
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Access token missing', code: 'ACCESS_TOKEN_MISSING' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Access token expired or invalid', code: 'ACCESS_TOKEN_EXPIRED' });
  }

  req.user = decoded;
  next();
};

// Serving Google Client ID to Frontend
app.get('/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// Request Passwordless Email OTP
app.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    // Enforce 60-second Resend Cooldown
    if (user && user.otpLastSent) {
      const timeSinceLastSent = new Date() - new Date(user.otpLastSent);
      if (timeSinceLastSent < 60 * 1000) {
        const secondsRemaining = Math.ceil((60 * 1000 - timeSinceLastSent) / 1000);
        return res.status(429).json({ error: `Please wait ${secondsRemaining} seconds before requesting another code.` });
      }
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: hashedOtp,
          otpExpires,
          otpAttempts: 0,
          otpLastSent: new Date()
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          otpCode: hashedOtp,
          otpExpires,
          otpAttempts: 0,
          otpLastSent: new Date(),
          provider: 'email',
          role: 'USER'
        }
      });
    }

    // Send email using Resend API helper
    await sendOtpEmail(email, otp);
    res.json({ message: 'Verification code sent successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP & Authenticate/Register
app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpCode || !user.otpExpires) {
      return res.status(400).json({ error: 'No active OTP request found for this email.' });
    }

    // Check expiration (5 minutes)
    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempt limits (brute-force protection)
    if (user.otpAttempts >= 3) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode: null, otpExpires: null }
      });
      return res.status(400).json({ error: 'Too many failed verification attempts. Please request a new code.' });
    }

    const hashedInput = hashOtp(otp);
    if (user.otpCode !== hashedInput) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } }
      });
      const attemptsRemaining = 3 - updatedUser.otpAttempts;
      return res.status(400).json({
        error: `Invalid verification code. You have ${attemptsRemaining} attempts remaining.`,
        attemptsRemaining
      });
    }

    // Reset OTP columns on success and set otpVerified: true
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        otpVerified: true,
        otpCode: null,
        otpExpires: null,
        otpAttempts: 0
      }
    });

    // Generate JWT access & refresh tokens
    const { accessToken, refreshToken } = generateTokens(verifiedUser);

    // Save refresh token in DB
    await prisma.user.update({
      where: { id: verifiedUser.id },
      data: { refreshToken }
    });

    // Set cookies
    res.cookie('token', accessToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 15 * 60 * 1000 }); // 15 mins
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    res.json({
      message: 'Authentication successful',
      user: { id: verifiedUser.id, name: verifiedUser.name, email: verifiedUser.email, role: verifiedUser.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth Authentication
app.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Credential token is required' });
    }

    // Verify token with Google's tokeninfo API
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const tokenInfo = await verifyRes.json();

    if (!verifyRes.ok || tokenInfo.error) {
      return res.status(401).json({ error: 'Invalid Google credential token' });
    }

    // Verify client ID to prevent spoofing
    if (process.env.GOOGLE_CLIENT_ID && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Google client ID mismatch' });
    }

    const { email, name, sub: googleId } = tokenInfo;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email,
          role: 'USER',
          googleId,
          provider: 'google',
          otpVerified: true
        }
      });
    } else {
      // If user exists, link their Google ID and switch provider to include google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          otpVerified: true,
          provider: user.provider.includes('google') ? user.provider : `${user.provider},google`
        }
      });
    }

    // Generate JWT access & refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // Set cookies
    res.cookie('token', accessToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 15 * 60 * 1000 }); // 15 mins
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    res.json({
      message: 'Google login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Refresh Access Token Route
app.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing', code: 'REFRESH_TOKEN_MISSING' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ error: 'Refresh token expired or invalid', code: 'REFRESH_TOKEN_EXPIRED' });
    }

    // Verify stored token in DB to prevent reuse/leakage
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Session invalidated. Please log in again.', code: 'SESSION_INVALID' });
    }

    // Rotate refresh tokens
    const tokens = generateTokens(user);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.cookie('token', tokens.accessToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: 'Token refreshed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Secure Admin Signup
app.post('/admin-signup', async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;
    
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'Invalid admin secret code' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        provider: 'email',
        otpVerified: true
      },
    });

    res.status(201).json({ message: 'Admin created successfully.', user: { id: newAdmin.id, name: newAdmin.name, role: newAdmin.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Check auth status & get profile data
app.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, role: user.role, name: user.name, email: user.email, provider: user.provider });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile data
app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email }
    });
    
    res.json({ id: updatedUser.id, role: updatedUser.role, name: updatedUser.name, email: updatedUser.email, provider: updatedUser.provider });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Logout
app.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Invalidate refresh token in database
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null }
    });

    res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'lax' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'lax' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT_USER || 3001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
