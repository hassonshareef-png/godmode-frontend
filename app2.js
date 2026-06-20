const API_BASE = "https://nexadash-backend-1.onrender.com"; // Connected to your Render backend

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
      errorEl.textContent = "❌ Missing username or password";
      return;
    }

    errorEl.textContent = "🔐 Authenticating...";

    try {
      console.log(`📡 Calling: ${API_BASE}/login`);
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
      });

      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.error) {
        errorEl.textContent = `❌ ${data.error}`;
        return;
      }

      // ✅ Login successful
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("god", data.god || false);
      localStorage.setItem("universe", data.universe || false);
      errorEl.textContent = "";
      
      document.getElementById("login-screen").classList.remove("active");
      document.getElementById("home-screen").classList.add("active");
      document.body.className = "galaxy mode-basic";
      
      console.log("✅ Login successful!");

    } catch (err) {
      console.error("Login error:", err);
      errorEl.textContent = `❌ Connection error: ${err.message}`;
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
    document.getElementById("free-output").textContent = "🎯 Quick Pick: " + n;
  },

  async backendPrediction(out, premium=false) {
    const outputEl = document.getElementById(out);
    outputEl.textContent = premium ? "⚡ Premium Engine Activated..." : "🎮 Free Engine Activated...";

    try {
      console.log(`📡 Calling: ${API_BASE}/predict`);
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ god: premium, universe: false })
      });

      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      console.log("Prediction response:", data);
      
      outputEl.textContent = data.prediction || JSON.stringify(data, null, 2);
    } catch (err) {
      console.error("Prediction error:", err);
      outputEl.textContent = `❌ Error: ${err.message}`;
    }
  },

  async director() {
    const seed = document.getElementById("director-seed").value.trim();
    const outputEl = document.getElementById("director-output");
    outputEl.textContent = "🎬 Director compiling...";

    try {
      console.log(`📡 Calling: ${API_BASE}/director`);
      const response = await fetch(`${API_BASE}/director`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: seed || null })
      });

      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      console.log("Director response:", data);
      
      outputEl.textContent = data.output || JSON.stringify(data, null, 2);
    } catch (err) {
      console.error("Director error:", err);
      outputEl.textContent = `❌ Error: ${err.message}`;
    }
  },

  async pick3() {
    const v = document.getElementById("pick3-input").value.trim();
    const outputEl = document.getElementById("pick3-output");

    if (v.length !== 3 || !/^\d{3}$/.test(v)) {
      outputEl.textContent = "❌ Error: Enter exactly 3 digits (0-9)";
      return;
    }

    outputEl.textContent = "🎲 Processing Pick 3...";

    try {
      console.log(`📡 Calling: ${API_BASE}/pick3`);
      const response = await fetch(`${API_BASE}/pick3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: v })
      });

      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      console.log("Pick3 response:", data);
      
      outputEl.textContent = data.result || JSON.stringify(data, null, 2);
    } catch (err) {
      console.error("Pick3 error:", err);
      outputEl.textContent = `❌ Error: ${err.message}`;
    }
  },

  async pick4() {
    const v = document.getElementById("pick4-input").value.trim();
    const outputEl = document.getElementById("pick4-output");

    if (v.length !== 4 || !/^\d{4}$/.test(v)) {
      outputEl.textContent = "❌ Error: Enter exactly 4 digits (0-9)";
      return;
    }

    outputEl.textContent = "🎰 Processing Pick 4...";

    try {
      console.log(`📡 Calling: ${API_BASE}/pick4`);
      const response = await fetch(`${API_BASE}/pick4`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: v })
      });

      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      console.log("Pick4 response:", data);
      
      outputEl.textContent = data.result || JSON.stringify(data, null, 2);
    } catch (err) {
      console.error("Pick4 error:", err);
      outputEl.textContent = `❌ Error: ${err.message}`;
    }
  },

  logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("god");
    localStorage.removeItem("universe");
    document.getElementById("home-screen").classList.remove("active");
    document.getElementById("login-screen").classList.add("active");
    document.getElementById("login-user").value = "";
    document.getElementById("login-pass").value = "";
    document.getElementById("login-error").textContent = "";
  }
};

// Health check on load
window.addEventListener("load", () => {
  console.log(`✅ Frontend loaded`);
  console.log(`📡 Backend API: ${API_BASE}`);
  
  // Optional: Test backend connection
  fetch(`${API_BASE}/health`)
    .then(r => r.json())
    .then(data => console.log("✅ Backend health:", data))
    .catch(err => console.warn("⚠️ Backend connection warning:", err.message));
});
