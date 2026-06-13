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
    const state = document.getElementById("state-select").value;
    const out = document.getElementById("prediction-text");

    if (!state) {
        out.textContent = "Select a state first.";
        return;
    }

    out.textContent = `Prediction for ${state}: GODMODE++ logic engaged.`;
}

// ---- SYSTEM TOOLS ----
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

12-34-56
