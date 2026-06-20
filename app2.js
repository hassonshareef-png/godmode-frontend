const API_BASE = "https://godmode-backend.onrender.com"; // Update with your actual backend URL

const UI = {
  show(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screen + "-screen").classList.add("active");

    // MODE SWITCHING FOR THEME
    if (["free","pick3","pick4"].includes(screen)) {
      document.body.className = "galaxy mode-basic";
    }
    if (screen === "god") {
      document.body.className = "galaxy mode-god";
    }
    if (screen === "universe") {
      document.body.className = "galaxy mode-universe";
    }
    if (screen === "director") {
      document.body.className = "galaxy mode-director";
    }
  },

  async login() {
    const u = document.getElementById("login-user").value.trim();
    const p = document.getElementById("login-pass").value.trim();
    const errorEl = document.getElementById("login-error");

    if (!u || !p) {
      errorEl.textContent = "Missing credentials";
      return;
    }

    errorEl.textContent = "Logging in...";

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
      });

      const data = await response.json();

      if (data.error) {
        errorEl.textContent = data.error;
        return;
      }

      // ✅ Login successful
      localStorage.setItem("user", JSON.stringify(data));
      errorEl.textContent = "";
      
      document.getElementById("login-screen").classList.remove("active");
      document.getElementById("home-screen").classList.add("active");
      document.body.className = "galaxy mode-basic";

    } catch (err) {
      errorEl.textContent = "Connection error: " + err.message;
    }
  },

  unlockPremium() {
    document.getElementById("premium-overlay").classList.add("hidden");
  },

  closePremium() {
    document.getElementById("premium-overlay").classList.add("hidden");
  },

  quickPick() {
    const n = Math.floor(Math.random() * 1000);
    document.getElementById("free-output").textContent = "Quick Pick: " + n;
  },

  async backendPrediction(out, premium=false) {
    const outputEl = document.getElementById(out);
    outputEl.textContent = premium ? "Premium Engine Activated..." : "Free Engine Activated...";

    try {
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ god: premium, universe: false })
      });

      const data = await response.json();
      outputEl.textContent = data.prediction || JSON.stringify(data);
    } catch (err) {
      outputEl.textContent = "Error: " + err.message;
    }
  },

  async director() {
    const seed = document.getElementById("director-seed").value.trim();
    const outputEl = document.getElementById("director-output");
    outputEl.textContent = "Director compiling...";

    try {
      const response = await fetch(`${API_BASE}/director`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: seed || null })
      });

      const data = await response.json();
      outputEl.textContent = data.output || JSON.stringify(data);
    } catch (err) {
      outputEl.textContent = "Error: " + err.message;
    }
  },

  async pick3() {
    const v = document.getElementById("pick3-input").value.trim();
    const outputEl = document.getElementById("pick3-output");

    if (v.length !== 3 || !/^\d{3}$/.test(v)) {
      outputEl.textContent = "Error: Enter exactly 3 digits";
      return;
    }

    outputEl.textContent = "Processing...";

    try {
      const response = await fetch(`${API_BASE}/pick3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: v })
      });

      const data = await response.json();
      outputEl.textContent = data.result || JSON.stringify(data);
    } catch (err) {
      outputEl.textContent = "Error: " + err.message;
    }
  },

  async pick4() {
    const v = document.getElementById("pick4-input").value.trim();
    const outputEl = document.getElementById("pick4-output");

    if (v.length !== 4 || !/^\d{4}$/.test(v)) {
      outputEl.textContent = "Error: Enter exactly 4 digits";
      return;
    }

    outputEl.textContent = "Processing...";

    try {
      const response = await fetch(`${API_BASE}/pick4`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: v })
      });

      const data = await response.json();
      outputEl.textContent = data.result || JSON.stringify(data);
    } catch (err) {
      outputEl.textContent = "Error: " + err.message;
    }
  }
};
