// ── API Configuration ──────────────────────────────────────────────────────
// To use a different backend, set window.GODMODE_API_BASE before this script
// loads (e.g. via a <script> tag or your deployment platform config).
const API_BASE = window.GODMODE_API_BASE || "https://godmode-backend.onrender.com";

// Owner username — used to unlock Director Mode fast-path shortcuts
const OWNER_USERNAME = "hassonshareef";

// Warn if using plaintext HTTP outside of localhost (tokens would be exposed)
if (typeof window !== "undefined" && API_BASE.startsWith("http://") &&
    !API_BASE.includes("localhost") && !API_BASE.includes("127.0.0.1")) {
  console.warn("⚠️ GODMODE++ is connecting to an HTTP (non-HTTPS) backend. " +
               "Tokens and credentials will be transmitted in plaintext. " +
               "Use HTTPS in production.");
}

// How often to check whether the access token is about to expire (ms)
const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Internal state
let _refreshInterval = null;

// ── UI Object ──────────────────────────────────────────────────────────────
const UI = {

  // ── Navigation ─────────────────────────────────────────────────────────

  show(screen) {
    if (screen === "director") {
      const token = AuthUtils.getToken();
      if (!token || AuthUtils.isTokenExpired(token)) {
        UI._setMsg(document.getElementById("login-error"), "🔒 Please log in to access Director Mode", "error");
        screen = "login";
      }
    }

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

    if (screen === "home")     this.renderAutoTask();
    if (screen === "director") this.renderDirectorWorkout();
    if (screen === "universe") this.renderUniverseWorkouts();

    if (["free", "god", "universe", "director"].includes(screen)) {
      setTimeout(() => this.renderDashboard(screen), 50);
    }
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
        body: JSON.stringify({ email: identifier, password })
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

      // Owner fast-path: go straight to Director Mode
      // (small delay lets the home screen render before switching screens)
      if (data.username === OWNER_USERNAME ||
          (AuthUtils.getUserInfo() && AuthUtils.getUserInfo().username === OWNER_USERNAME)) {
        setTimeout(() => UI.show("director"), 100);
      }

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

      const successEl = document.getElementById("reset-success");
      UI._setMsg(successEl, "✅ Password reset! Redirecting to login...", "success");
      setTimeout(() => {
        UI._setMsg(successEl, "", "success");
        UI._setMsg(document.getElementById("login-error"),
                   "✅ Password reset! Please log in.", "success");
        this.show("login");
      }, 1500);

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
        // Backward-compat legacy keys (deprecated – use AuthUtils.getUserInfo().tier instead)
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
    }, TOKEN_REFRESH_INTERVAL_MS);
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

    // Show Director Mode shortcut for owner
    const dirShortcut = document.getElementById("director-shortcut-btn");
    if (dirShortcut) {
      dirShortcut.style.display = (user.username === OWNER_USERNAME) ? "" : "none";
    }

    this.renderAutoTask();
  },

  _updatePremiumButtons(tier) {
    const godBtn      = document.getElementById("god-mode-btn");
    const universeBtn = document.getElementById("universe-mode-btn");
    const heroBtn     = document.getElementById("god-mode-hero-btn");
    const heroBtnSub  = document.getElementById("god-btn-sub");
    const heroBtnArrow = document.getElementById("god-btn-arrow");

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

    if (heroBtn) {
      if (hasGod) {
        heroBtn.classList.add("unlocked");
        heroBtn.onclick = () => UI.show("god");
        if (heroBtnSub)   heroBtnSub.textContent   = "Tap to activate premium engine";
        if (heroBtnArrow) heroBtnArrow.textContent  = "▶";
      } else {
        heroBtn.classList.remove("unlocked");
        heroBtn.onclick = () => UI.showPremiumGate("god");
        if (heroBtnSub)   heroBtnSub.textContent   = "Upgrade to unlock";
        if (heroBtnArrow) heroBtnArrow.textContent  = "🔒";
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

  // ── Auto Task Card ───────────────────────────────────────────────────────

  _autoTaskPool: [
    { emoji: "🎯", text: "Run a Quick Pick and trust the numbers today.", action: () => { UI.show("free"); setTimeout(() => UI.quickPickGen("free"), 200); } },
    { emoji: "🎲", text: "Try Pick 3 — enter a lucky 3-digit combo.", action: () => UI.show("pick3") },
    { emoji: "🎰", text: "Try Pick 4 — your next big 4-digit hit awaits.", action: () => UI.show("pick4") },
    { emoji: "🎬", text: "Use Director Mode with a custom seed today.", action: () => UI.show("director") },
    { emoji: "⚙️", text: "Run a Free Backend Prediction now.", action: () => { UI.show("free"); setTimeout(() => UI.backendPrediction("free-output"), 200); } },
    { emoji: "⚡", text: "Activate God Mode for a premium prediction.", action: () => UI.showPremiumGate("god") },
    { emoji: "🌌", text: "Unlock Universe Mode for infinite possibilities.", action: () => UI.showPremiumGate("universe") },
    { emoji: "🔢", text: "Play Pick 3 with digits from today's date.", action: () => { UI.show("pick3"); const d = new Date(); const el = document.getElementById("pick3-input"); if(el) el.value = (d.getDate() % 10) + "" + ((d.getMonth()+1) % 10) + "" + (d.getFullYear() % 10); } },
    { emoji: "🎱", text: "Pick 4 using today's hour, minute, and two lucky digits.", action: () => { UI.show("pick4"); const n = new Date(); const el = document.getElementById("pick4-input"); if(el) el.value = String(Math.floor(n.getHours() / 10)) + String(n.getHours() % 10) + String(Math.floor(Math.random()*10)) + String(Math.floor(Math.random()*10)); } },
    { emoji: "🚀", text: "Run the backend prediction engine in Free Mode.", action: () => { UI.show("free"); setTimeout(() => UI.backendPrediction("free-output"), 200); } },
    { emoji: "🌟", text: "Check your profile tier to unlock premium modes.", action: () => UI.showProfile() },
    { emoji: "🔥", text: "Generate a lucky seed for Director Mode.", action: () => { UI.show("director"); const el = document.getElementById("director-seed"); if(el) el.value = Math.floor(Math.random()*999999); } }
  ],

  _currentAutoTask: null,

  _pickAutoTask() {
    const pool = this._autoTaskPool;
    // Use date-seeded index for the day's default task, but allow refresh
    const today = new Date().toDateString();
    const stored = (() => { try { return JSON.parse(localStorage.getItem("godmode_auto_task")); } catch(e) { return null; } })();
    if (stored && stored.date === today && stored.idx != null && !stored.refreshed) {
      return stored.idx;
    }
    // Pick a random index different from the stored one
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && stored && idx === stored.idx);
    try { localStorage.setItem("godmode_auto_task", JSON.stringify({ date: today, idx, refreshed: false })); } catch(e) {}
    return idx;
  },

  renderAutoTask() {
    const idx  = this._pickAutoTask();
    const task = this._autoTaskPool[idx];
    if (!task) return;
    this._currentAutoTask = task;
    const emojiEl  = document.getElementById("auto-task-emoji");
    const textEl   = document.getElementById("auto-task-text");
    if (emojiEl) emojiEl.textContent = task.emoji;
    if (textEl)  textEl.textContent  = task.text;
  },

  refreshAutoTask() {
    // Mark as refreshed so _pickAutoTask picks a new random one
    try {
      const stored = JSON.parse(localStorage.getItem("godmode_auto_task")) || {};
      localStorage.setItem("godmode_auto_task", JSON.stringify({ ...stored, refreshed: true }));
    } catch(e) {}
    const pool = this._autoTaskPool;
    const old  = this._currentAutoTask;
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && pool[idx] === old);
    try {
      const today = new Date().toDateString();
      localStorage.setItem("godmode_auto_task", JSON.stringify({ date: today, idx, refreshed: false }));
    } catch(e) {}
    const task = pool[idx];
    this._currentAutoTask = task;
    const emojiEl = document.getElementById("auto-task-emoji");
    const textEl  = document.getElementById("auto-task-text");
    if (emojiEl) { emojiEl.style.transform = "scale(0)"; setTimeout(() => { emojiEl.textContent = task.emoji; emojiEl.style.transform = ""; }, 150); }
    if (textEl)  { textEl.style.opacity = "0"; setTimeout(() => { textEl.textContent = task.text; textEl.style.opacity = "1"; }, 150); }
  },

  runAutoTask() {
    if (this._currentAutoTask && typeof this._currentAutoTask.action === "function") {
      this._currentAutoTask.action();
    }
  },


  // ── Workout Auto-Select Engine ──────────────────────────────────────────
  // Scores each workout by digit overlap with root energy digits.
  // Tier 1 (8, 3) = 2 pts each  |  Tier 2 (6, 9, 4, 5) = 1 pt each
  // Director Mode → single best Pick 4 workout
  // Universe Mode → top 3 Pick 4 workouts (rotating display)

  _workouts: [
    // ── Pick 3 ──
    { name: "111 Rundown",          type: "p3", key: "111"  },
    { name: "123 Math Rundown",     type: "p3", key: "123"  },
    { name: "123 Rundown",          type: "p3", key: "123"  },
    { name: "137 Math Rundown",     type: "p3", key: "137"  },
    { name: "182 Rundown",          type: "p3", key: "182"  },
    { name: "222 Rundown",          type: "p3", key: "222"  },
    { name: "234 Rundown",          type: "p3", key: "234"  },
    { name: "235 Rundown",          type: "p3", key: "235"  },
    { name: "246 Rundown",          type: "p3", key: "246"  },
    { name: "257 Math Rundown",     type: "p3", key: "257"  },
    { name: "284 Rundown",          type: "p3", key: "284"  },
    { name: "317 Rundown",          type: "p3", key: "317"  },
    { name: "333 Rundown",          type: "p3", key: "333"  },
    { name: "345 Rundown",          type: "p3", key: "345"  },
    { name: "369 Math Rundown",     type: "p3", key: "369"  },
    { name: "369 Rundown",          type: "p3", key: "369"  },
    { name: "397 Rundown",          type: "p3", key: "397"  },
    { name: "421 Rundown",          type: "p3", key: "421"  },
    { name: "444 Rundown",          type: "p3", key: "444"  },
    { name: "456 Rundown",          type: "p3", key: "456"  },
    { name: "471 Rundown",          type: "p3", key: "471"  },
    { name: "513 Rundown",          type: "p3", key: "513"  },
    { name: "654 Rundown",          type: "p3", key: "654"  },
    { name: "666 Rundown",          type: "p3", key: "666"  },
    { name: "678 Rundown",          type: "p3", key: "678"  },
    { name: "693 Rundown",          type: "p3", key: "693"  },
    { name: "713 Rundown",          type: "p3", key: "713"  },
    { name: "777 Rundown",          type: "p3", key: "777"  },
    { name: "789 Rundown",          type: "p3", key: "789"  },
    { name: "793 Rundown",          type: "p3", key: "793"  },
    { name: "815 Rundown",          type: "p3", key: "815"  },
    { name: "842 Rundown",          type: "p3", key: "842"  },
    { name: "862 Rundown",          type: "p3", key: "862"  },
    { name: "873 Rundown",          type: "p3", key: "873"  },
    { name: "888 Rundown",          type: "p3", key: "888"  },
    { name: "973 Rundown",          type: "p3", key: "973"  },
    { name: "999 Rundown",          type: "p3", key: "999"  },
    // ── Pick 4 ──
    { name: "1111 Rundown",         type: "p4", key: "1111" },
    { name: "1212 Rundown",         type: "p4", key: "1212" },
    { name: "1234 Math Rundown",    type: "p4", key: "1234" },
    { name: "1234 Rundown",         type: "p4", key: "1234" },
    { name: "1379 Math Rundown",    type: "p4", key: "1379" },
    { name: "1412 Rundown",         type: "p4", key: "1412" },
    { name: "1919 Rundown",         type: "p4", key: "1919" },
    { name: "2121 Rundown",         type: "p4", key: "2121" },
    { name: "2222 Rundown",         type: "p4", key: "2222" },
    { name: "2345 Rundown",         type: "p4", key: "2345" },
    { name: "2367 Math Rundown",    type: "p4", key: "2367" },
    { name: "3173 Rundown",         type: "p4", key: "3173" },
    { name: "3175 Rundown",         type: "p4", key: "3175" },
    { name: "3197 Rundown",         type: "p4", key: "3197" },
    { name: "3317 Rundown",         type: "p4", key: "3317" },
    { name: "3333 Rundown",         type: "p4", key: "3333" },
    { name: "3456 Rundown",         type: "p4", key: "3456" },
    { name: "3567 Math Rundown",    type: "p4", key: "3567" },
    { name: "3737 Rundown",         type: "p4", key: "3737" },
    { name: "3842 Rundown",         type: "p4", key: "3842" },
    { name: "3917 Rundown",         type: "p4", key: "3917" },
    { name: "4444 Rundown",         type: "p4", key: "4444" },
    { name: "4567 Rundown",         type: "p4", key: "4567" },
    { name: "5678 Rundown",         type: "p4", key: "5678" },
    { name: "5713 Rundown",         type: "p4", key: "5713" },
    { name: "6317 Rundown",         type: "p4", key: "6317" },
    { name: "6412 Rundown",         type: "p4", key: "6412" },
    { name: "6666 Rundown",         type: "p4", key: "6666" },
    { name: "6789 Rundown",         type: "p4", key: "6789" },
    { name: "7193 Rundown",         type: "p4", key: "7193" },
    { name: "7319 Rundown",         type: "p4", key: "7319" },
    { name: "7777 Rundown",         type: "p4", key: "7777" },
    { name: "7913 Rundown",         type: "p4", key: "7913" },
    { name: "8113 Rundown",         type: "p4", key: "8113" },
    { name: "8347 Rundown",         type: "p4", key: "8347" },
    { name: "8888 Rundown",         type: "p4", key: "8888" },
    { name: "9999 Rundown",         type: "p4", key: "9999" },
  ],

  _scoreWorkout(w) {
    const t1 = new Set(["8", "3"]);
    const t2 = new Set(["6", "9", "4", "5"]);
    let score = 0;
    for (const ch of w.key) {
      if (t1.has(ch))      score += 2;
      else if (t2.has(ch)) score += 1;
    }
    return score;
  },

  bestDirectorWorkout() {
    const p4 = this._workouts.filter(w => w.type === "p4");
    if (!p4.length) return null;
    return p4.reduce((best, w) =>
      this._scoreWorkout(w) >= this._scoreWorkout(best) ? w : best, p4[0]);
  },

  topUniverseWorkouts(n = 3) {
    return this._workouts
      .filter(w => w.type === "p4")
      .map(w => ({ ...w, score: this._scoreWorkout(w) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  },

  renderDirectorWorkout() {
    const el = document.getElementById("director-workout-suggest");
    if (!el) return;
    const best = this.bestDirectorWorkout();
    if (!best) return;
    const score = this._scoreWorkout(best);
    el.innerHTML =
      '<span class="workout-label">🎯 Best Workout Auto-Selected:</span>' +
      '<strong class="workout-name">' + best.name + '</strong>' +
      ' <span class="workout-score">⚡ score ' + score + '</span>';
  },

  renderUniverseWorkouts() {
    const el = document.getElementById("universe-workout-suggest");
    if (!el) return;
    const top = this.topUniverseWorkouts(3);
    if (!top.length) return;
    const medals = ["🥇", "🥈", "🥉"];
    el.innerHTML = '<div class="workout-label">🌌 Top Workouts (Root Engine):</div>' +
      top.map((w, i) =>
        '<div class="workout-row">' +
        '<span class="workout-rank">' + medals[i] + '</span> ' +
        '<strong class="workout-name">' + w.name + '</strong>' +
        ' <span class="workout-score">⚡ ' + w.score + '</span>' +
        '</div>'
      ).join("");
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
    link.href = stripeUrl;
    const btn = link.querySelector("button");
    if (btn) btn.textContent = "Unlock " + tierLabel;

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

    const isUniverse = (out === "universe-output");

    try {
      // Determine which endpoint to call based on tier
      const endpoint = isUniverse ? "/universe/predict" : (premium ? "/god/predict" : "/basic/predict");
      const response = await this._authenticatedFetch(API_BASE + endpoint, {
        method: "GET"
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
      // Use the /director/3175 endpoint with multipart/form-data
      const formData = new FormData();
      formData.append('history', JSON.stringify(seed ? [seed] : []));
      
      const response = await this._authenticatedFetch(API_BASE + "/director/3175", {
        method: "POST",
        body: formData,
        headers: {} // FormData sets Content-Type automatically
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

  async _pickPredict({ inputId, outputId, endpoint, label, digits }) {
    const inputEl  = document.getElementById(inputId);
    const outputEl = document.getElementById(outputId);
    const number   = inputEl ? inputEl.value.trim() : "";
    const re       = new RegExp("^\\d{" + digits + "}$");

    if (!re.test(number)) {
      outputEl.textContent = "❌ Please enter exactly " + digits + " digits (0–9).";
      return;
    }

    outputEl.textContent = "🔮 Analyzing " + label + "...";

    try {
      const response = await this._authenticatedFetch(API_BASE + endpoint, {
        method: "POST",
        body: JSON.stringify({ number })
      });
      if (!response) return;

      if (!response.ok) {
        outputEl.textContent = "⚠️ " + label + " is temporarily unavailable. Please try again later.";
        return;
      }

      const data = await response.json();
      outputEl.textContent = data.prediction || JSON.stringify(data, null, 2);
    } catch (err) {
      outputEl.textContent = !navigator.onLine
        ? "❌ No internet connection"
        : "❌ Error: " + err.message;
    }
  },

  async pick3() {
    return this._pickPredict({ inputId: "pick3-input", outputId: "pick3-output",
                               endpoint: "/pick3/predict", label: "Pick 3", digits: 3 });
  },

  async pick4() {
    return this._pickPredict({ inputId: "pick4-input", outputId: "pick4-output",
                               endpoint: "/pick4/predict", label: "Pick 4", digits: 4 });
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

    // Don't override Content-Type if body is FormData (it sets its own)
    const headers = options.body instanceof FormData 
      ? { 'Authorization': 'Bearer ' + token, ...(options.headers || {}) }
      : { ...AuthUtils.getAuthHeaders(), ...(options.headers || {}) };
    const response = await fetch(url, { ...options, headers });

    // Retry once after token refresh on 401
    if (response.status === 401) {
      const refreshed = await this._refreshToken();
      if (refreshed) {
        const retryToken = AuthUtils.getToken();
        const retryHeaders = options.body instanceof FormData
          ? { 'Authorization': 'Bearer ' + retryToken, ...(options.headers || {}) }
          : { ...AuthUtils.getAuthHeaders(), ...(options.headers || {}) };
        return fetch(url, { ...options, headers: retryHeaders });
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
  },

  // ── Quick Pick Generator ─────────────────────────────────────────────────

  _pickTypeState: { free: "p3", god: "p4", universe: "p5", director: "p3" },

  _screenClass(screen) {
    return screen === "god" ? "gold" : screen === "universe" ? "purple" : screen === "director" ? "red" : "";
  },

  setPickTab(screen, type, btn) {
    this._pickTypeState[screen] = type;
    const tabs = btn.parentElement.querySelectorAll(".tab-btn");
    tabs.forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    const count = type === "p3" ? 3 : type === "p4" ? 4 : 5;
    const display = document.getElementById(screen + "-qp-display");
    if (!display) return;
    const cls = this._screenClass(screen);
    display.innerHTML = Array(count).fill(
      '<span class="qp-number' + (cls ? " " + cls : "") + '">?</span>'
    ).join("");
  },

  quickPickGen(screen) {
    const type  = this._pickTypeState[screen] || "p3";
    const count = type === "p3" ? 3 : type === "p4" ? 4 : 5;
    const history = this._getPickHistory(screen);
    const freq    = this._digitFrequency(history);
    const digits  = [];
    for (let i = 0; i < count; i++) digits.push(this._weightedDigit(freq));

    this._savePick(digits, type, screen);

    const display = document.getElementById(screen + "-qp-display");
    if (display) {
      const cls = this._screenClass(screen);
      display.innerHTML = digits.map((d, idx) =>
        '<span class="qp-number' + (cls ? " " + cls : "") + ' neon-pop" style="animation-delay:' + (idx * 0.07) + 's">' + d + "</span>"
      ).join("");
    }

    this.renderDashboard(screen);
  },

  _weightedDigit(freq) {
    const vals = Object.values(freq);
    const maxF = Math.max(...vals, 1);
    const weights = Array.from({ length: 10 }, (_, d) => 1 + Math.round((freq[d] / maxF) * 2));
    const total   = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let d = 0; d <= 9; d++) { r -= weights[d]; if (r <= 0) return d; }
    return Math.floor(Math.random() * 10);
  },

  // ── History & Storage ────────────────────────────────────────────────────

  _getPickHistory(screen) {
    try {
      const all = JSON.parse(localStorage.getItem("godmode_picks") || "[]");
      return screen ? all.filter(p => p.screen === screen) : all;
    } catch(e) { return []; }
  },

  _savePick(digits, type, screen) {
    try {
      const all = JSON.parse(localStorage.getItem("godmode_picks") || "[]");
      all.unshift({
        id: Date.now(),
        digits,
        type,
        screen,
        timestamp: new Date().toISOString(),
        result: null
      });
      localStorage.setItem("godmode_picks", JSON.stringify(all.slice(0, 120)));
    } catch(e) {}
  },

  togglePickResult(id) {
    try {
      const all = JSON.parse(localStorage.getItem("godmode_picks") || "[]");
      const pick = all.find(p => p.id === id);
      if (!pick) return;
      pick.result = pick.result === null ? "win" : pick.result === "win" ? "loss" : null;
      localStorage.setItem("godmode_picks", JSON.stringify(all));
      this.renderDashboard(pick.screen);
    } catch(e) {}
  },

  _digitFrequency(history) {
    const freq = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    history.forEach(p => {
      if (Array.isArray(p.digits)) p.digits.forEach(d => { freq[d] = (freq[d] || 0) + 1; });
    });
    return freq;
  },

  // ── Dashboard Render ─────────────────────────────────────────────────────

  renderDashboard(screen) {
    this._renderHotCold(screen);
    this._renderRecentPicks(screen);
    this._renderPatternAnalysis(screen);
    this._renderFreqChart(screen);
  },

  _renderHotCold(screen) {
    const history = this._getPickHistory(screen);
    const freq    = this._digitFrequency(history);
    const sorted  = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const hot  = sorted.slice(0, 4);
    const cold = sorted.slice(-4).reverse();

    const hotEl  = document.getElementById(screen + "-hot-numbers");
    const coldEl = document.getElementById(screen + "-cold-numbers");

    if (hotEl) {
      if (!history.length) {
        hotEl.innerHTML = '<span class="no-data">Generate to track</span>';
      } else {
        hotEl.innerHTML = hot.map(([d]) =>
          '<span class="num-badge hot">' + d + "</span>"
        ).join("");
      }
    }
    if (coldEl) {
      if (!history.length) {
        coldEl.innerHTML = '<span class="no-data">Generate to track</span>';
      } else {
        coldEl.innerHTML = cold.map(([d]) =>
          '<span class="num-badge cold">' + d + "</span>"
        ).join("");
      }
    }
  },

  _renderRecentPicks(screen) {
    const el = document.getElementById(screen + "-recent-picks");
    if (!el) return;
    const history = this._getPickHistory(screen).slice(0, 10);
    if (!history.length) {
      el.innerHTML = '<p class="no-data">No predictions yet — hit GENERATE!</p>';
      return;
    }
    el.innerHTML = history.map(p => {
      const t   = new Date(p.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const lbl = p.type === "p3" ? "Pick 3" : p.type === "p4" ? "Pick 4" : "Pick 5";
      const digs = Array.isArray(p.digits) ? p.digits.join(" ") : "?";
      const rc   = p.result || "pending";
      const rl   = p.result === "win" ? "🏆 WIN" : p.result === "loss" ? "❌ LOSS" : "· · ·";
      return '<div class="pred-card ' + rc + '" onclick="UI.togglePickResult(' + p.id + ')">' +
        '<span class="pred-digits">' + digs + "</span>" +
        '<span class="pred-type">'   + lbl  + "</span>" +
        '<span class="pred-result">' + rl   + "</span>" +
        '<span class="pred-time">'   + t    + "</span>" +
        "</div>";
    }).join("");
  },

  _renderPatternAnalysis(screen) {
    const el = document.getElementById(screen + "-pattern-analysis");
    if (!el) return;
    const history = this._getPickHistory(screen);
    if (history.length < 3) {
      el.innerHTML = '<p class="no-data">Generate picks to see patterns...</p>';
      return;
    }
    let odd = 0, even = 0, high = 0, low = 0, total = 0;
    history.forEach(p => {
      if (Array.isArray(p.digits)) p.digits.forEach(d => {
        total++;
        d % 2 === 0 ? even++ : odd++;
        d >= 5 ? high++ : low++;
      });
    });
    const op = total ? Math.round(odd  / total * 100) : 50;
    const ep = 100 - op;
    const hp = total ? Math.round(high / total * 100) : 50;
    const lp = 100 - hp;

    el.innerHTML =
      '<div class="pattern-row">' +
        '<span class="patt-label">Odd/Even</span>' +
        '<div class="patt-bar-wrap"><div class="patt-bar odd" style="width:' + op + '%"></div></div>' +
        '<span class="patt-pct">' + op + '% / ' + ep + '%</span>' +
      '</div>' +
      '<div class="pattern-row">' +
        '<span class="patt-label">High/Low</span>' +
        '<div class="patt-bar-wrap"><div class="patt-bar high" style="width:' + hp + '%"></div></div>' +
        '<span class="patt-pct">' + hp + '% / ' + lp + '%</span>' +
      '</div>';
  },

  _renderFreqChart(screen) {
    const el = document.getElementById(screen + "-chart");
    if (!el) return;
    const history = this._getPickHistory(screen);
    const freq    = this._digitFrequency(history);
    const maxF    = Math.max(...Object.values(freq), 1);
    el.innerHTML  = Array.from({ length: 10 }, (_, d) => {
      const h = history.length ? Math.round((freq[d] / maxF) * 100) : 0;
      return '<div class="chart-bar-wrap">' +
        '<div class="chart-bar" style="height:' + Math.max(h, 2) + '%"></div>' +
        '<div class="chart-label">' + d + "</div>" +
        "</div>";
    }).join("");
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

  // Owner shortcut: ?director in URL goes straight to Director Mode if authenticated
  const goDirector = urlParams.get("director") !== null;
  if (goDirector) {
    const t = AuthUtils.getToken();
    if (t && !AuthUtils.isTokenExpired(t)) {
      await UI._fetchUserInfo();
      UI._startRefreshInterval();
      UI.show("director");
      UI._updateHomeScreen();
      return;
    } else {
      // Not logged in — show login with a hint message
      UI.show("login");
      UI._setMsg(document.getElementById("login-error"), "🎬 Log in to enter Director Mode", "info");
      return;
    }
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

  // Health check (non-blocking) + keep-alive ping every 10 minutes
  const pingBackend = () =>
    fetch(API_BASE + "/health")
      .then(r => r.json())
      .then(data => console.log("✅ Backend health:", data))
      .catch(err => console.warn("⚠️ Backend connection warning:", err.message));

  pingBackend();
  setInterval(pingBackend, 10 * 60 * 1000);
});
