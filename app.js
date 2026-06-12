// ===============================
// GODMODE++ API CONFIG
// ===============================
const API_BASE_URL = "https://godmode-backend2.onrender.com";

class GodModeAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, method = "GET", body = null) {
        const url = `${this.baseURL}${endpoint}`;

        const options = {
            method,
            headers: { "Content-Type": "application/json" }
        };

        if (body) options.body = JSON.stringify(body);

        const res = await fetch(url, options);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return await res.json();
    }

    login(username, password) {
        return this.request("/auth/login", "POST", { username, password });
    }

    checkPremium(userId) {
        return this.request(`/premium/verify/${userId}`, "GET");
    }

    getPrediction(state) {
        return this.request(`/predict/${state}`, "GET");
    }

    health() {
        return this.request("/health", "GET");
    }
}

const GODMODE = new GodModeAPI(API_BASE_URL);


// ===============================
// UI HELPERS
// ===============================
function log(msg) {
    const box = document.getElementById("log-text");
    box.textContent += msg + "\n";
}

function setBackendStatus(ok) {
    const el = document.getElementById("backend-status");
    if (ok) {
        el.textContent = "Backend: Alive";
        el.className = "status-pill ok";
    } else {
        el.textContent = "Backend: Offline";
        el.className = "status-pill off";
    }
}

function setPremiumStatus(ok) {
    const el = document.getElementById("premium-status");
    if (ok) {
        el.textContent = "Premium: Active";
        el.className = "status-pill ok";
    } else {
        el.textContent = "Premium: Locked";
        el.className = "status-pill off";
    }
}

function clearOutputs() {
    document.getElementById("log-text").textContent = "";
    document.getElementById("prediction-text").textContent = "";
}


// ===============================
// LOGIN
// ===============================
let CURRENT_USER_ID = null;

async function login() {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();

    if (!u || !p) {
        log("❌ Missing username or password");
        return;
    }

    log("🔐 Logging in…");

    try {
        const res = await GODMODE.login(u, p);
        CURRENT_USER_ID = res.userId;

        log("✅ Login successful");
        log("User ID: " + CURRENT_USER_ID);
    } catch (err) {
        log("❌ Login failed: " + err.message);
    }
}


// ===============================
// PREMIUM CHECK
// ===============================
async function checkPremium() {
    if (!CURRENT_USER_ID) {
        log("❌ Login first");
        return;
    }

    log("🔎 Checking premium…");

    try {
        const res = await GODMODE.checkPremium(CURRENT_USER_ID);

        if (res.premium === true) {
            setPremiumStatus(true);
            log("⭐ Premium active");
        } else {
            setPremiumStatus(false);
            log("⚠️ Premium NOT active");
        }
    } catch (err) {
        log("❌ Premium check failed: " + err.message);
    }
}


// ===============================
// PREDICTION ENGINE
// ===============================
async function getPrediction() {
    const state = document.getElementById("state-select").value;

    if (!state) {
        log("❌ Select a state first");
        return;
    }

    log("🎯 Fetching prediction for " + state + "…");

    try {
        const res = await GODMODE.getPrediction(state);
        document.getElementById("prediction-text").textContent =
            JSON.stringify(res, null, 2);

        log("✅ Prediction received");
    } catch (err) {
        log("❌ Prediction failed: " + err.message);
    }
}


// ===============================
// BACKEND HEALTH CHECK
// ===============================
async function testConnection() {
    log("🔄 Checking backend…");

    try {
        const res = await GODMODE.health();
        setBackendStatus(true);
        log("✅ Backend OK: " + JSON.stringify(res));
    } catch (err) {
        setBackendStatus(false);
        log("❌ Backend unreachable: " + err.message);
    }
}


// ===============================
// HEARTBEAT (KEEP BACKEND AWAKE)
// ===============================
async function heartbeat() {
    try {
        await GODMODE.health();
        document.getElementById("heartbeat").className = "status-pill pulse";
    } catch {
        document.getElementById("heartbeat").className = "status-pill off";
    }
}

function manualHeartbeat() {
    log("💓 Manual heartbeat ping");
    heartbeat();
}

setInterval(heartbeat, 15000); // every 15 seconds

// Initial check
testConnection();
heartbeat();
