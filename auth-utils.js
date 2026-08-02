// auth-utils.js - JWT token utilities for GODMODE++

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_INFO_KEY = 'userInfo';

const AuthUtils = {
  // ── Token Storage ──────────────────────────────────────────────────────────

  setTokens(accessToken, refreshToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    // Clear legacy keys
    localStorage.removeItem('user');
    localStorage.removeItem('god');
    localStorage.removeItem('universe');
  },

  // ── Authorization Header ───────────────────────────────────────────────────

  getAuthHeaders() {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  },

  // ── JWT Decode & Expiry ────────────────────────────────────────────────────

  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  },

  isTokenExpired(token) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    return Date.now() / 1000 > payload.exp;
  },

  // Returns true when token expires within `withinSeconds` (default: 5 min)
  isTokenExpiringSoon(token, withinSeconds = 300) {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    return (payload.exp - Date.now() / 1000) < withinSeconds;
  },

  // ── User Info ──────────────────────────────────────────────────────────────

  getUserInfo() {
    try {
      const raw = localStorage.getItem(USER_INFO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setUserInfo(info) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  },

  // Check if current user meets or exceeds a required tier
  hasTier(required) {
    const info = this.getUserInfo();
    if (!info) return false;
    const order = ['free', 'god', 'universe'];
    const normalizedRequired = (required || '').toLowerCase();
    const normalizedTier = (info.tier || 'free').toLowerCase();
    const reqIdx = order.indexOf(normalizedRequired);
    const tierIdx = order.indexOf(normalizedTier);
    if (reqIdx === -1) return false;
    if (tierIdx === -1) return false;
    return tierIdx >= reqIdx;
  },

  // ── Validation Helpers ─────────────────────────────────────────────────────

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Returns an error string, or null if valid.
  // Supported special characters: ! @ # $ % ^ & * ( ) , . ? " : { } | < > - _ + = ~ ` [ ] \ ; ' /
  // Ensure your backend accepts the same set when updating this list.
  validatePassword(password) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[!@#$%^&*(),.?":{}|<>\-_+=~`[\]\\;'/]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  },

  // Returns an error string, or null if valid
  validateUsername(username) {
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be at most 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username may only contain letters, numbers, and underscores';
    }
    return null;
  }
};
