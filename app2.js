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
const DIRECTOR_PASSCODE = "8118";

const modeCards = document.querySelectorAll(".mode-card");
const modeScreen = document.getElementById("mode-screen");
const directorUnlockBtn = document.getElementById("director-unlock-btn");
const directorPassInput = document.getElementById("director-passcode");
const directorStatus = document.getElementById("director-unlock-status");

let directorUnlocked = false;

modeCards.forEach(card => {
  card.addEventListener("click", () => {
    const mode = card.dataset.mode;

    if (mode === "director" && !directorUnlocked) {
      directorStatus.textContent = "Director Mode is locked. Enter passcode.";
      return;
    }

    loadModeScreen(mode);
  });
});

directorUnlockBtn.addEventListener("click", () => {
  const value = directorPassInput.value.trim();
  if (value === DIRECTOR_PASSCODE) {
    directorUnlocked = true;
    directorStatus.textContent = "Director Mode unlocked.";
    const directorCard = document.querySelector('.mode-card[data-mode="director"]');
    directorCard.classList.remove("mode-locked");
    directorCard.innerHTML = "<h2>Director Mode ✅</h2><p>Owner‑only control panel.</p>";
  } else {
    directorStatus.textContent = "Incorrect passcode.";
  }
});

function loadModeScreen(mode) {
  if (mode === "basic") {
    modeScreen.innerHTML = `
        <h2>Basic Mode</h2>
        <p>This is your quick rundown mode.</p>

        <div class="field">
            <label>Pick a State</label>
            <select id="basic-state">
                <option value="">Choose…</option>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
                <option value="PA">Pennsylvania</option>
                <option value="CA">California</option>
                <option value="FL">Florida</option>
            </select>
        </div>

        <button onclick="runBasic()">Run Basic Rundown</button>

        <div class="output-box">
            <div class="output-title">Basic Output</div>
            <pre id="basic-output"></pre>
        </div>
    `;
  } else if (mode === "god") {
    modeScreen.innerHTML = `
        <h2>God Mode</h2>
        <p>Full engine with prediction, mirrors, flips, and rundown fusion.</p>

        <div class="field">
            <label>Pick a State</label>
            <select id="god-state">
                <option value="">Choose…</option>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
                <option value="PA">Pennsylvania</option>
                <option value="CA">California</option>
                <option value="FL">Florida</option>
            </select>
        </div>

        <button onclick="runGodMode()">Run God Mode Engine</button>

        <div class="output-box">
            <div class="output-title">God Mode Output</div>
            <pre id="god-output"></pre>
        </div>
    `;
}

  } else if (mode === "universe") {
    modeScreen.innerHTML = `
        <h2>Universe Mode</h2>
        <p>Cosmic logic, drift profiles, and multi‑state fusion.</p>

        <div class="field">
            <label>Pick a State</label>
            <select id="universe-state">
                <option value="">Choose…</option>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
                <option value="PA">Pennsylvania</option>
                <option value="CA">California</option>
                <option value="FL">Florida</option>
            </select>
        </div>

        <button onclick="runUniverseMode()">Run Universe Engine</button>

        <div class="output-box">
            <div class="output-title">Universe Output</div>
            <pre id="universe-output"></pre>
        </div>
    `;
}

}

  } else if (mode === "director") {
    modeScreen.innerHTML = `
        <h2>Director Mode</h2>
        <p>Owner‑only control panel.</p>

        <div class="field">
            <label>System Command</label>
            <input id="director-command" type="text" placeholder="Enter command…">
        </div>

        <button onclick="runDirectorCommand()">Execute</button>

        <div class="output-box">
            <div class="output-title">Director Output</div>
            <pre id="director-output"></pre>
        </div>
    `;
}

  }
}

function runBasic() {
    const state = document.getElementById("basic-state").value;
    document.getElementById("basic-output").textContent =
        state ? `Basic rundown for ${state}…` : "Choose a state first.";
}
function runGodMode() {
    const state = document.getElementById("god-state").value;
    document.getElementById("god-output").textContent =
        state ? `God Mode engine running for ${state}…` : "Choose a state first.";
}
function runDirectorCommand() {
    const cmd = document.getElementById("director-command").value.trim();
    document.getElementById("director-output").textContent =
        cmd ? `Executing: ${cmd}` : "Enter a command.";
}
function runUniverseMode() {
    const state = document.getElementById("universe-state").value;
    document.getElementById("universe-output").textContent =
        state ? `Universe Mode activated for ${state}…` : "Choose a state first.";
}
