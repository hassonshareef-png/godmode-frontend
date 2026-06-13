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
