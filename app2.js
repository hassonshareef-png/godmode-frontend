// GODMODE++ SIMPLE WIRED JS

// ---- LOGIN ----
function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const log = document.getElementById("log-text");

    if (!user || !pass) {
        log.textContent += "\n[LOGIN] Missing username or password.";
        return;
    }

    log.textContent += `\n[LOGIN] User '${user}' logged in.`;
    const premium = document.getElementById("premium-status");
    premium.classList.remove("off");
    premium.classList.add("ok");
    premium.textContent = "Premium: Active";
}

// ---- PREMIUM CHECK ----
function checkPremium() {
    const log = document.getElementById("log-text");
    log.textContent += "\n[PREMIUM] Premium status checked: ACTIVE.";
}

// ---- PREDICTION ----
function getPrediction() {
   const bar = document.getElementById("loadingBar");
bar.style.width = "0%";
setTimeout(() => bar.style.width = "100%", 50);

    const state = document.getElementById("state-select").value;
    const out = document.getElementById("prediction-text");

    if (!state) {
        out.textContent = "Select a state first.";
        return;
    }

    out.textContent = `Prediction for ${state}: GODMODE++ logic engaged.`;
}

// ---- SYSTEM TOOLS ----
function appendLog(msg) {
    const log = document.getElementById("log-text");
    log.innerText += msg + "\n";
    log.scrollTop = log.scrollHeight;
}

function testConnection() {
    const log = document.getElementById("log-text");
    log.textContent += "\n[SYSTEM] Backend ping: OK (mock).";
}

function manualHeartbeat() {
    const log = document.getElementById("log-text");
    log.textContent += "\n[SYSTEM] Heartbeat pinged.";
}

function clearOutputs() {
    document.getElementById("log-text").textContent = "";
    document.getElementById("prediction-text").textContent = "";
}

// ---- MODE SELECTOR ----
document.body.className = `${mode}-mode`;

const modeScreen = document.getElementById("mode-screen");
const modeCards = document.querySelectorAll(".mode-card");

modeCards.forEach(card => {
    card.addEventListener("click", () => {
        const mode = card.getAttribute("data-mode");

        if (card.classList.contains("mode-locked")) {
            modeScreen.textContent = "Director Mode is locked. Enter passcode.";
            return;
        }

        if (mode === "basic") {
            modeScreen.textContent = "Basic Mode: quick rundown active.";
        } else if (mode === "god") {
            modeScreen.textContent = "God Mode: full engine engaged.";
        } else if (mode === "universe") {
            modeScreen.textContent = "Universe Mode: cosmic logic online.";
        } else if (mode === "director") {
            modeScreen.textContent = "Director Mode: OWNER‑LEVEL controls unlocked.";
        }
    });
});

// ---- DIRECTOR MODE UNLOCK (PASSCODE 8118) ----
document.getElementById("director-unlock-btn").addEventListener("click", () => {
    const pass = document.getElementById("director-passcode").value.trim();
    const status = document.getElementById("director-unlock-status");
    const directorCard = document.querySelector(".mode-card[data-mode='director']");
body.director-mode {
    animation: commandPulse 6s infinite alternate ease-in-out;
}

@keyframes commandPulse {
    0% { background-color: #001a1a; }
    100% { background-color: #002525; }
}

    if (pass === "8118") {
        directorCard.classList.remove("mode-locked");
        status.textContent = "Director Mode unlocked.";
        status.style.color = "#00ff88";
    } else {
        status.textContent = "Incorrect passcode.";
        status.style.color = "#ff4444";
    }
});
// =========================
// MODE SELECTOR LOGIC
// =========================
document.body.className = `${mode}-mode`;

let activeMode = "basic";

document.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => {
        const mode = card.dataset.mode;

        // Director mode locked unless unlocked
        if (mode === "director" && !window.directorUnlocked) {
            document.getElementById("director-unlock-status").innerText =
                "Director Mode is locked.";
            return;
        }

        activeMode = mode;

        // Highlight active card
        document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        // Update mode screen
        document.getElementById("mode-screen").innerText =
            `Active Mode: ${mode.toUpperCase()}`;
    });
});
// =========================
// DIRECTOR MODE UNLOCK
// =========================
body.director-mode {
    background: radial-gradient(circle at 50% 50%, #001f1f, #000);
    animation: none;
}

body.director-mode .panel {
    box-shadow: 0 0 22px rgba(0, 255, 149, 0.55);
    border-color: rgba(0, 255, 149, 0.55);
}

window.directorUnlocked = false;

document.getElementById("director-unlock-btn").addEventListener("click", () => {
    const pass = document.getElementById("director-passcode").value;

    if (pass === "7777") {   // you can change this
        window.directorUnlocked = true;
        document.getElementById("director-unlock-status").innerText =
            "Director Mode Unlocked!";
        document.querySelector("[data-mode='director']").classList.remove("mode-locked");
    } else {
        document.getElementById("director-unlock-status").innerText =
            "Incorrect passcode.";
    }
});
// =========================
// PREMIUM CHECK
// =========================

function checkPremium() {
    const user = document.getElementById("username").value;

    if (user.toLowerCase() === "owner") {
        document.getElementById("premium-status").classList.remove("off");
        document.getElementById("premium-status").classList.add("ok");
        document.getElementById("premium-status").innerText = "Premium: Active";
    } else {
        document.getElementById("premium-status").innerText = "Premium: Locked";
    }
}
// =========================
// PREDICTION ENGINE
// =========================

async function getPrediction() {
    const state = document.getElementById("state-select").value;

    if (!state) {
        document.getElementById("prediction-text").innerText =
            "Please select a state first.";
        return;
    }

    document.getElementById("prediction-text").innerText = "Loading...";

    try {
        const res = await fetch(`https://godmode-backend2.onrender.com/predict/${state}`);
        const data = await res.json();

        document.getElementById("prediction-text").innerText =
            `🎯 Prediction (${activeMode.toUpperCase()} Mode)\n\n${data.prediction}`;
    } catch (err) {
        document.getElementById("prediction-text").innerText =
            "Error fetching prediction.";
    }
}
🎯 Prediction (GOD MODE)
12-34-56
// =========================
// SYSTEM TOOLS
// =========================

function testConnection() {
    document.getElementById("log-text").innerText += "Testing backend...\n";
}

function manualHeartbeat() {
    document.getElementById("log-text").innerText += "Heartbeat ping sent.\n";
}

function clearOutputs() {
    document.getElementById("log-text").innerText = "";
    document.getElementById("prediction-text").innerText = "";
}


function testConnection() {
    appendLog("Testing backend...");
}

function manualHeartbeat() {
    appendLog("Heartbeat ping sent.");
}
body.basic-mode {
    --text-accent: #00eaff;
}

body.god-mode {
    --text-accent: #ff00ff;
}

body.universe-mode {
    --text-accent: #ffae00;
}

body.director-mode {
    --text-accent: #00ff95;
}
@media (max-width: 600px) {
    .panel {
        padding: 14px;
    }
    h1 {
        font-size: 26px;
    }
    button {
        padding: 12px;
    }
}
