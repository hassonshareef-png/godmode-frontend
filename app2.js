// ── API Configuration ──────────────────────────────────────────────────────
// To use a different backend, set window.GODMODE_API_BASE before this script
// loads (e.g. via a <script> tag or your deployment platform config).
const API_BASE = (window.GODMODE_API_BASE) || "http://localhost:8000";

// Internal state
let _refreshInterval = null;

// ── UI Object ──────────────────────────────────────────────────────────────
const UI = {

  // ── Navigation ─────────────────────────────────────────────────────────

  show(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screen + "-screen").classList.add("active");

    const basicScreens = ["free", "pick3", "pick4", "login", "signup",
                          "forgot-password", "reset-password", "profile", "home"];
    if (basicScreens.includes(screen)) {
      document.body.className = "galaxy mode-basic";
    }
    if (screen === "god")      document.body.className = "galaxy mode-god";
    if (screen === "universe") document.body.className = "galaxy mode-universe";
    if (screen === "director") document.body.className = "galaxy mode-director";
  },

  showLoader() {
    document.getElementById("global-loader").classList.remove("hidden");
  },

  hideLoader() {
    document.getElementById("global-loader").classList.add("hidden");
  },

  // ── Login ───────────────────────────────────────────────────────────────

  async login() {
    const identifier = document.getElementById("login-user").value.trim();
    const password   = document.getElementById("login-pass").value.trim();
    const errorEl    = document.getElementById("login-error");

    if (!identifier || !password) {
      UI._setMsg(errorEl, "❌ Missing username/email or password", "error");
      return;
    }

    UI._setMsg(errorEl, "🔐 Authenticating...", "info");
    this.showLoader();

    try {
      const response = await fetch(API_BASE + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();

      if (!response.ok) {
        UI._setMsg(errorEl, "❌ " + (data.detail || data.error || "Login failed"), "error");
        return;
      }

      // Store tokens
      AuthUtils.setTokens(data.access_token, data.refresh_token);

      // Fetch profile & set up session
      await this._fetchUserInfo();
      this._startRefreshInterval();

      // Clear inputs
      document.getElementById("login-user").value = "";
      document.getElementById("login-pass").value = "";
      errorEl.textContent = "";

      this.show("home");
      this._updateHomeScreen();

    } catch (err) {
      const msg = !navigator.onLine ? "❌ No internet connection"
                                    : "❌ Connection error: " + err.message;
      UI._setMsg(errorEl, msg, "error");
    } finally {
      this.hideLoader();
    }
  },

  // ── Signup ──────────────────────────────────────────────────────────────

  async signup() {
    const username = document.getElementById("signup-username").value.trim();
    const email    = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-pass").value.trim();
    const confirm  = document.getElementById("signup-confirm").value.trim();
    const errorEl  = document.getElementById("signup-error");

    const usernameErr = AuthUtils.validateUsername(username);
    if (usernameErr) { UI._setMsg(errorEl, "❌ " + usernameErr, "error"); return; }

    if (!AuthUtils.validateEmail(email)) {
      UI._setMsg(errorEl, "❌ Invalid email address", "error"); return;
    }

    const passErr = AuthUtils.validatePassword(password);
    if (passErr) { UI._setMsg(errorEl, "❌ " + passErr, "error"); return; }

    if (password !== confirm) {
      UI._setMsg(errorEl, "❌ Passwords do not match", "error"); return;
    }

    UI._setMsg(errorEl, "🚀 Creating account...", "info");
    this.showLoader();

    try {
      const response = await fetch(API_BASE + "/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        UI._setMsg(errorEl, "❌ " + (data.detail || data.error || "Signup failed"), "error");
        return;
      }

      // Clear inputs & redirect to login
      ["signup-username", "signup-email", "signup-pass", "signup-confirm"]
        .forEach(id => { document.getElementById(id).value = ""; });
      errorEl.textContent = "";

      UI._setMsg(document.getElementById("login-error"),
                 "✅ Account created! Please log in.", "success");
      this.show("login");

    } catch (err) {
      const msg = !navigator.onLine ? "❌ No internet connection"
                                    : "❌ Connection error: " + err.message;
      UI._setMsg(errorEl, msg, "error");
    } finally {
      this.hideLoader();
    }
  },

  // ── Forgot Password ─────────────────────────────────────────────────────

  async forgotPassword() {
    const email     = document.getElementById("forgot-email").value.trim();
    const errorEl   = document.getElementById("forgot-error");
    const successEl = document.getElementById("forgot-success");

    if (!AuthUtils.validateEmail(email)) {
      UI._setMsg(errorEl, "❌ Please enter a valid email address", "error");
      successEl.textContent = "";
      return;
    }

    errorEl.textContent = "";
    UI._setMsg(successEl, "📧 Sending reset email...", "info");
    this.showLoader();

    try {
      const response = await fetch(API_BASE + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        successEl.textContent = "";
        UI._setMsg(errorEl, "❌ " + (data.detail || data.error || "Request failed"), "error");
        return;
      }

      UI._setMsg(successEl, "✅ If that email exists, a reset link has been sent.", "success");
      document.getElementById("forgot-email").value = "";

      // Dev mode: backend may return the token directly
      if (data.reset_token) {
        document.getElementById("reset-token").value = data.reset_token;
      }

    } catch (err) {
      successEl.textContent = "";
      const msg = !navigator.onLine ? "❌ No internet connection"
                                    : "❌ Connection error: " + err.message;
      UI._setMsg(errorEl, msg, "error");
    } finally {
      this.hideLoader();
    }
  },

  // ── Reset Password ──────────────────────────────────────────────────────

  async resetPassword() {
    const token      = document.getElementById("reset-token").value.trim();
    const newPass    = document.getElementById("reset-pass").value.trim();
    const confirmPass = document.getElementById("reset-confirm").value.trim();
    const errorEl    = document.getElementById("reset-error");

    if (!token) { UI._setMsg(errorEl, "❌ Reset token is required", "error"); return; }

    const passErr = AuthUtils.validatePassword(newPass);
    if (passErr) { UI._setMsg(errorEl, "❌ " + passErr, "error"); return; }

    if (newPass !== confirmPass) {
      UI._setMsg(errorEl, "❌ Passwords do not match", "error"); return;
    }

    UI._setMsg(errorEl, "🔒 Resetting password...", "info");
    this.showLoader();

    try {
      const response = await fetch(API_BASE + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPass })
      });

      const data = await response.json();

      if (!response.ok) {
        UI._setMsg(errorEl, "❌ " + (data.detail || data.error || "Reset failed"), "error");
        return;
      }

      errorEl.textContent = "";
      ["reset-token", "reset-pass", "reset-confirm"]
        .forEach(id => { document.getElementById(id).value = ""; });

      UI._setMsg(document.getElementById("login-error"),
                 "✅ Password reset! Please log in.", "success");
      this.show("login");

    } catch (err) {
      const msg = !navigator.onLine ? "❌ No internet connection"
                                    : "❌ Connection error: " + err.message;
      UI._setMsg(errorEl, msg, "error");
    } finally {
      this.hideLoader();
    }
  },

  // ── Session Helpers ─────────────────────────────────────────────────────

  async _fetchUserInfo() {
    try {
      const response = await fetch(API_BASE + "/auth/me", {
        headers: AuthUtils.getAuthHeaders()
      });

      if (response.ok) {
        const user = await response.json();
        AuthUtils.setUserInfo(user);
        // Backward-compat legacy keys
        localStorage.setItem("god",      String(user.tier === "god" || user.tier === "universe"));
        localStorage.setItem("universe", String(user.tier === "universe"));
        return user;
      }

      if (response.status === 401) {
        const refreshed = await this._refreshToken();
        if (!refreshed) this._forceLogout();
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch user info:", err.message);
    }
    return null;
  },

  async _refreshToken() {
    const refreshToken = AuthUtils.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(API_BASE + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        AuthUtils.setTokens(data.access_token, data.refresh_token || refreshToken);
        return true;
      }
    } catch (err) {
      console.warn("⚠️ Token refresh failed:", err.message);
    }
    return false;
  },

  _startRefreshInterval() {
    if (_refreshInterval) clearInterval(_refreshInterval);
    _refreshInterval = setInterval(async () => {
      const token = AuthUtils.getToken();
      if (token && AuthUtils.isTokenExpiringSoon(token, 300)) {
        const refreshed = await UI._refreshToken();
        if (!refreshed) UI._forceLogout();
      }
    }, 5 * 60 * 1000);
  },

  _forceLogout() {
    if (_refreshInterval) { clearInterval(_refreshInterval); _refreshInterval = null; }
    AuthUtils.clearAuth();
    this.show("login");
    UI._setMsg(document.getElementById("login-error"),
               "⏰ Session expired. Please log in again.", "error");
  },

  _updateHomeScreen() {
    const user = AuthUtils.getUserInfo();
    if (!user) return;

    const welcomeEl = document.getElementById("home-welcome");
    if (welcomeEl) {
      welcomeEl.textContent = "👋 Welcome, " + (user.username || user.email);
    }

    this._updatePremiumButtons(user.tier || "free");
  },

  _updatePremiumButtons(tier) {
    const godBtn      = document.getElementById("god-mode-btn");
    const universeBtn = document.getElementById("universe-mode-btn");

    const hasGod      = (tier === "god" || tier === "universe");
    const hasUniverse = (tier === "universe");

    if (godBtn) {
      if (hasGod) {
        godBtn.textContent = "⚡ God Mode";
        godBtn.onclick     = () => UI.show("god");
        godBtn.style.background   = "rgba(255,200,0,0.15)";
        godBtn.style.borderColor  = "rgba(255,200,0,0.4)";
        godBtn.style.color        = "#ffd700";
      } else {
        godBtn.textContent = "⚡ God Mode 🔒";
        godBtn.onclick     = () => UI.showPremiumGate("god");
        godBtn.style.background   = "rgba(255,200,0,0.1)";
        godBtn.style.borderColor  = "rgba(255,200,0,0.25)";
        godBtn.style.color        = "#ffd700";
      }
    }

    if (universeBtn) {
      if (hasUniverse) {
        universeBtn.textContent = "🌌 Universe Mode";
        universeBtn.onclick     = () => UI.show("universe");
        universeBtn.style.background  = "rgba(200,100,255,0.15)";
        universeBtn.style.borderColor = "rgba(200,100,255,0.4)";
        universeBtn.style.color       = "#da70d6";
      } else {
        universeBtn.textContent = "🌌 Universe Mode 🔒";
        universeBtn.onclick     = () => UI.showPremiumGate("universe");
        universeBtn.style.background  = "rgba(200,100,255,0.1)";
        universeBtn.style.borderColor = "rgba(200,100,255,0.25)";
        universeBtn.style.color       = "#da70d6";
      }
    }
  },

  // ── Premium Gate ────────────────────────────────────────────────────────

  showPremiumGate(tier) {
    const tierLabel = tier === "god" ? "God Mode" : "Universe Mode";
    const stripeUrl = tier === "god"
      ? "https://buy.stripe.com/aFabJ1e4L5pT7Ba8bxc7u04"
      : "https://buy.stripe.com/4gMfZh8Kr19D3kUdvRc7u03";

    document.getElementById("premium-overlay-title").textContent =
      "🔒 " + tierLabel + " Required";
    const link = document.getElementById("premium-stripe-link");
    link.href        = stripeUrl;
    link.textContent = "Unlock " + tierLabel;

    document.getElementById("premium-overlay").classList.remove("hidden");
  },

  closePremium() {
    document.getElementById("premium-overlay").classList.add("hidden");
  },

  // ── Profile ─────────────────────────────────────────────────────────────

  showProfile() {
    const user = AuthUtils.getUserInfo();
    if (user) {
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      set("profile-username", user.username || "—");
      set("profile-email",    user.email    || "—");
      set("profile-tier",     (user.tier    || "free").toUpperCase());
    }
    this.show("profile");
  },

  // ── Predictions ─────────────────────────────────────────────────────────

  quickPick() {
    const n = Math.floor(Math.random() * 1000);
    document.getElementById("free-output").textContent = "🎯 Quick Pick: " + n;
  },

  async backendPrediction(out, premium = false) {
    const outputEl = document.getElementById(out);
    outputEl.textContent = premium ? "⚡ Premium Engine Activated..."
                                   : "🎮 Free Engine Activated...";

    // Enforce premium gating
    if (premium) {
      const user = AuthUtils.getUserInfo();
      const tier = user ? (user.tier || "free") : "free";

      if (out === "god-output" && tier !== "god" && tier !== "universe") {
        outputEl.textContent = "🔒 God Mode requires a premium subscription.";
        this.showPremiumGate("god");
        return;
      }
      if (out === "universe-output" && tier !== "universe") {
        outputEl.textContent = "🔒 Universe Mode requires a Universe subscription.";
        this.showPremiumGate("universe");
        return;
      }
    }

    try {
      const response = await this._authenticatedFetch(API_BASE + "/predict", {
        method: "POST",
        body: JSON.stringify({ god: premium, universe: false })
      });
      if (!response) return;
      const data = await response.json();
      outputEl.textContent = data.prediction || JSON.stringify(data, null, 2);
    } catch (err) {
      outputEl.textContent = !navigator.onLine
        ? "❌ No internet connection"
        : "❌ Error: " + err.message;
    }
  },

  async director() {
    const seed     = document.getElementById("director-seed").value.trim();
    const outputEl = document.getElementById("director-output");
    outputEl.textContent = "🎬 Director compiling...";

    try {
      const response = await this._authenticatedFetch(API_BASE + "/director", {
        method: "POST",
        body: JSON.stringify({ seed: seed || null })
      });
      if (!response) return;
      const data = await response.json();
      outputEl.textContent = data.output || JSON.stringify(data, null, 2);
    } catch (err) {
      outputEl.textContent = !navigator.onLine
        ? "❌ No internet connection"
        : "❌ Error: " + err.message;
    }
  },

  async pick3() {
    const v        = document.getElementById("pick3-input").value.trim();
    const outputEl = document.getElementById("pick3-output");

    if (v.length !== 3 || !/^\d{3}$/.test(v)) {
      outputEl.textContent = "❌ Error: Enter exactly 3 digits (0-9)";
      return;
    }

    outputEl.textContent = "🎲 Processing Pick 3...";

    try {
      const response = await this._authenticatedFetch(API_BASE + "/pick3", {
        method: "POST",
        body: JSON.stringify({ number: v })
      });
      if (!response) return;
      const data = await response.json();
      outputEl.textContent = data.result || JSON.stringify(data, null, 2);
    } catch (err) {
      outputEl.textContent = !navigator.onLine
        ? "❌ No internet connection"
        : "❌ Error: " + err.message;
    }
  },

  async pick4() {
    const v        = document.getElementById("pick4-input").value.trim();
    const outputEl = document.getElementById("pick4-output");

    if (v.length !== 4 || !/^\d{4}$/.test(v)) {
      outputEl.textContent = "❌ Error: Enter exactly 4 digits (0-9)";
      return;
    }

    outputEl.textContent = "🎰 Processing Pick 4...";

    try {
      const response = await this._authenticatedFetch(API_BASE + "/pick4", {
        method: "POST",
        body: JSON.stringify({ number: v })
      });
      if (!response) return;
      const data = await response.json();
      outputEl.textContent = data.result || JSON.stringify(data, null, 2);
    } catch (err) {
      outputEl.textContent = !navigator.onLine
        ? "❌ No internet connection"
        : "❌ Error: " + err.message;
    }
  },

  // ── Authenticated Fetch (with auto-refresh) ──────────────────────────────

  async _authenticatedFetch(url, options) {
    let token = AuthUtils.getToken();
    if (!token) { this._forceLogout(); return null; }

    // Proactively refresh if expiring soon
    if (AuthUtils.isTokenExpiringSoon(token, 300)) {
      const refreshed = await this._refreshToken();
      if (!refreshed) { this._forceLogout(); return null; }
      token = AuthUtils.getToken();
    }

    const headers = Object.assign({}, AuthUtils.getAuthHeaders(), options.headers || {});
    const response = await fetch(url, Object.assign({}, options, { headers }));

    // Retry once after token refresh on 401
    if (response.status === 401) {
      const refreshed = await this._refreshToken();
      if (refreshed) {
        const retryHeaders = Object.assign({}, AuthUtils.getAuthHeaders(), options.headers || {});
        return fetch(url, Object.assign({}, options, { headers: retryHeaders }));
      }
      this._forceLogout();
      return null;
    }

    return response;
  },

  // ── Logout ───────────────────────────────────────────────────────────────

  logout() {
    if (_refreshInterval) { clearInterval(_refreshInterval); _refreshInterval = null; }
    AuthUtils.clearAuth();
    this.show("login");
    document.getElementById("login-user").value = "";
    document.getElementById("login-pass").value = "";
    document.getElementById("login-error").textContent = "";
  },

  // ── Utility ─────────────────────────────────────────────────────────────

  _setMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.style.color = type === "success" ? "#00ff96"
                   : type === "info"    ? "rgba(200,200,100,0.9)"
                   :                      "#ff6b6b"; // error
  }
};

// ── App Init ───────────────────────────────────────────────────────────────
window.addEventListener("load", async () => {
  console.log("✅ GODMODE++ Frontend loaded");
  console.log("📡 Backend API: " + API_BASE);

  // Pre-fill reset token from URL query param (e.g. ?token=xxx)
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");
  if (resetToken) {
    const resetTokenEl = document.getElementById("reset-token");
    if (resetTokenEl) resetTokenEl.value = resetToken;
    UI.show("reset-password");
    return;
  }

  // Restore session if valid token exists
  const token = AuthUtils.getToken();
  if (token) {
    if (AuthUtils.isTokenExpired(token)) {
      const refreshed = await UI._refreshToken();
      if (!refreshed) { UI._forceLogout(); return; }
    }
    await UI._fetchUserInfo();
    UI._startRefreshInterval();
    UI.show("home");
    UI._updateHomeScreen();
  } else {
    UI.show("login");
  }

  // Health check (non-blocking)
  fetch(API_BASE + "/health")
    .then(r => r.json())
    .then(data => console.log("✅ Backend health:", data))
    .catch(err => console.warn("⚠️ Backend connection warning:", err.message));
});
