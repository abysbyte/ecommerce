/**
 * Authentication Service
 * Houses core logic for hashing OTPs, generating JWTs, and validating tokens.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'local_access_secret_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'local_refresh_secret_54321';

// Generate a random secure 6-digit OTP code
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash the OTP using SHA-256 for secure storage
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Generate short-lived Access Token and long-lived Refresh Token
const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, email: user.email };
  
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

// Verify the Access Token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    return null;
  }
};

// Verify the Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateOtp,
  hashOtp,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken
};
