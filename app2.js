/* ============================
   GODMODE++ FRONTEND ENGINE
   CLEAN PRODUCTION VERSION
   ============================ */

/* ---------------------------
   LOGIN
---------------------------- */
function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const log = document.getElementById("log-text");

    if (!user || !pass) {
        log.textContent += "\n[LOGIN] Missing username or password.";
        return;
    }

    log.textContent += `\n[LOGIN] User '${user}' logged in.`;

    // Auto‑activate premium on login
    const premium = document.getElementById("premium-status");
    premium.classList.remove("off");
    premium.classList.add("ok");
    premium.textContent = "Premium: Active";
}

/* ---------------------------
   PREMIUM CHECK
---------------------------- */
function checkPremium() {
    const user = document.getElementById("username").value.trim();
    const pill = document.getElementById("premium-status");

    if (user.toLowerCase() === "owner") {
        pill.classList.remove("off");
        pill.classList.add("ok");
        pill.textContent = "Premium: Active";
    } else {
        pill.classList.remove("ok");
        pill.classList.add("off");
        pill.textContent = "Premium: Locked";
    }
}

/* ---------------------------
   PREDICTION ENGINE
---------------------------- */
async function getPrediction() {
    const state = document.getElementById("state-select").value;
    const out = document.getElementById("prediction-text");
    const bar = document.getElementById("loadingBar");

    bar.style.width = "0%";
    setTimeout(() => bar.style.width = "100%", 50);

    if (!state) {
        out.textContent = "Please select a state first.";
        return;
    }

    out.textContent = "Loading...";

    try {
        const res = await fetch(`https://godmode-backend2.onrender.com/predict/${state}`);
        const data = await res.json();

        out.textContent = `🎯 Prediction (${activeMode.toUpperCase()} Mode)\n\n${data.prediction}`;
    } catch (err) {
        out.textContent = "Error fetching prediction.";
    }
}

/* ---------------------------
   SYSTEM TOOLS
---------------------------- */
function appendLog(msg) {
    const log = document.getElementById("log-text");
    log.textContent += msg + "\n";
    log.scrollTop = log.scrollHeight;
}

function testConnection() {
    appendLog("[SYSTEM] Backend ping sent.");
}

function manualHeartbeat() {
    appendLog("[SYSTEM] Heartbeat ping sent.");
}

function clearOutputs() {
    document.getElementById("log-text").textContent = "";
    document.getElementById("prediction-text").textContent = "";
}
function openUpgrade() {
    document.getElementById("upgradeModal").style.display = "flex";
}

function closeUpgrade() {
    document.getElementById("upgradeModal").style.display = "none";
}

/* ---------------------------
   MODE SELECTOR
---------------------------- */
let activeMode = "basic";
window.directorUnlocked = false;

const modeScreen = document.getElementById("mode-screen");
const modeCards = document.querySelectorAll(".mode-card");

modeCards.forEach(card => {
    card.addEventListener("click", () => {
        const mode = card.dataset.mode;

        // Director mode locked unless unlocked
        if (mode === "director" && !window.directorUnlocked) {
            document.getElementById("director-unlock-status").innerText =
                "Director Mode is locked.";
            return;
        }

        // Update active mode
        activeMode = mode;

        // Highlight active card
        document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        // ⭐ EXACT SPOT — MODE ACTIVATION ANIMATION ⭐
        document.body.classList.add("mode-anim");
        setTimeout(() => document.body.classList.remove("mode-anim"), 900);

        // Update mode screen
        document.getElementById("mode-screen").innerText =
            `Active Mode: ${mode.toUpperCase()}`;
    });
});


/* ---------------------------
   DIRECTOR MODE UNLOCK
---------------------------- */
document.getElementById("director-unlock-btn").addEventListener("click", () => {
    const pass = document.getElementById("director-passcode").value.trim();
    const status = document.getElementById("director-unlock-status");
    const directorCard = document.querySelector("[data-mode='director']");

    if (pass === "7777") {
        window.directorUnlocked = true;
        directorCard.classList.remove("mode-locked");
        status.textContent = "Director Mode Unlocked!";
        status.style.color = "#00ff95";
    } else {
        status.textContent = "Incorrect passcode.";
        status.style.color = "#ff4444";
    }
});
openUpgrade();

/* ---------------------------
   MODE‑BASED COLOR THEMES
---------------------------- */
function applyModeTheme() {
    document.body.classList.remove("basic-mode", "god-mode", "universe-mode", "director-mode");
    document.body.classList.add(`${activeMode}-mode`);
}

setInterval(applyModeTheme, 200);
