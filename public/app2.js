// ===============================
// GODMODE FRONTEND API CONNECTOR
// Full Remove + Replace Version
// ===============================

const API_BASE = "https://godmode-backend2.onrender.com";

// -------------------------------
// Backend Status Check
// -------------------------------
async function checkBackend() {
    const statusEl = document.getElementById("status");

    try {
        const res = await fetch(`${API_BASE}/`);
        const data = await res.json();

        console.log("Backend Response:", data);

        if (statusEl) statusEl.innerText = "Backend is LIVE";
    } catch (err) {
        console.error("Backend Error:", err);
        if (statusEl) statusEl.innerText = "Backend is DOWN";
    }
}

// -------------------------------
// AUTH: Login
// -------------------------------
async function login(username, password) {
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        return await res.json();
    } catch (err) {
        console.error("Login Error:", err);
        return { error: "Login failed" };
    }
}

// -------------------------------
// PREDICTION: Get Numbers
// -------------------------------
async function getPrediction() {
    try {
        const res = await fetch(`${API_BASE}/predict`);
        return await res.json();
    } catch (err) {
        console.error("Prediction Error:", err);
        return { error: "Prediction failed" };
    }
}

// -------------------------------
// PREMIUM: GODMODE++
// -------------------------------
async function getPremiumPrediction() {
    try {
        const res = await fetch(`${API_BASE}/premium/predict`);
        return await res.json();
    } catch (err) {
        console.error("Premium Error:", err);
        return { error: "Premium prediction failed" };
    }
}

// -------------------------------
// AUTO‑RUN ON PAGE LOAD
// -------------------------------
window.onload = () => {
    checkBackend();
};
