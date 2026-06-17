const API = "https://godmode-backend2.onrender.com";

const sfx = {
  click: new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"),
  success: new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"),
  error: new Audio("https://actions.google.com/sounds/v1/cartoon/boing.ogg")
};

let premiumUnlocked = false;
let pendingPremiumTarget = null;

const UI = {
  show(id) {
    document.querySelectorAll(".screen").forEach(s => {
      s.classList.remove("active");
    });
    const screen = document.getElementById(id + "-screen");
    if (screen) screen.classList.add("active");
    sfx.click.play().catch(() => {});
  },

  setLoading(on) {
    const loader = document.getElementById("global-loader");
    if (!loader) return;
    loader.classList.toggle("hidden", !on);
  },

  async login() {
    const user = document.getElementById("login-user").value;
    const pass = document.getElementById("login-pass").value;
    const errEl = document.getElementById("login-error");

    UI.setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();

      if (data.error) {
        errEl.innerText = data.error;
        sfx.error.play().catch(() => {});
      } else {
        errEl.innerText = "";
        UI.show("home");
        sfx.success.play().catch(() => {});
      }
    } catch (e) {
      errEl.innerText = "Login failed.";
      sfx.error.play().catch(() => {});
    } finally {
      UI.setLoading(false);
    }
  },

  async backendPrediction(outputId, premium = false) {
    if (premium && !premiumUnlocked) {
      UI.openPremium(null);
      return;
    }

    const out = document.getElementById(outputId);
    if (!out) return;

    UI.setLoading(true);
    out.innerText = "";

    try {
      const endpoint = premium ? `${API}/premium/predict` : `${API}/predict`;
      const res = await fetch(endpoint);
      const data = await res.json();
      out.innerText = JSON.stringify(data, null, 2);
      sfx.success.play().catch(() => {});
    } catch (e) {
      out.innerText = "Engine error.";
      sfx.error.play().catch(() => {});
    } finally {
      UI.setLoading(false);
    }
  },

  quickPick() {
    const nums = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join("");
    const out = document.getElementById("free-output");
    out.innerText = nums;
    sfx.click.play().catch(() => {});
  },

  director() {
    const seed = document.getElementById("director-seed").value;
    const out = document.getElementById("director-output");
    out.innerText = `Director Seed Processed: ${seed}`;
    sfx.click.play().catch(() => {});
  },

  pick3() {
    const v = document.getElementById("pick3-input").value;
    const out = document.getElementById("pick3-output");
    out.innerText = `Pick 3 processed: ${v}`;
    sfx.click.play().catch(() => {});
  },

  pick4() {
    const v = document.getElementById("pick4-input").value;
    const out = document.getElementById("pick4-output");
    out.innerText = `Pick 4 processed: ${v}`;
    sfx.click.play().catch(() => {});
  },

  openPremium(target) {
    pendingPremiumTarget = target;
    const overlay = document.getElementById("premium-overlay");
    overlay.classList.remove("hidden");
    sfx.click.play().catch(() => {});
  },

  closePremium() {
    const overlay = document.getElementById("premium-overlay");
    overlay.classList.add("hidden");
    pendingPremiumTarget = null;
    sfx.click.play().catch(() => {});
  },

  unlockPremium() {
    const key = document.getElementById("premium-key").value.trim();
    if (!key) return;

    // Simple placeholder logic: any non-empty key unlocks
    premiumUnlocked = true;
    UI.closePremium();
    sfx.success.play().catch(() => {});

    if (pendingPremiumTarget) {
      UI.show(pendingPremiumTarget);
    }
  }
};

// initial state
UI.show("login");

