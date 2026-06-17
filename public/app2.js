const API = "https://godmode-backend2.onrender.com";

const sfx = {
  click: new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg"),
  success: new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"),
  error: new Audio("https://actions.google.com/sounds/v1/cartoon/boing.ogg")
};

let premiumUnlockedUniverse = false;
let premiumUnlockedDirector = false;
let pendingPremiumTarget = null; // "universe" or "director"

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

  async backendPrediction(outputId, premiumTarget = null) {
    // premiumTarget: "universe" or null (Free/God)
    if (premiumTarget === "universe" && !premiumUnlockedUniverse) {
      UI.openPremium("universe");
      return;
    }

    const out = document.getElementById(outputId);
    if (!out) return;

    UI.setLoading(true);
    out.innerText = "";

    try {
      const endpoint =
        premiumTarget === "universe"
          ? `${API}/premium/predict`
          : `${API}/predict`;

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
    // Director mode itself is gated by 6→9 unlock
    if (!premiumUnlockedDirector) {
      UI.openPremium("director");
      return;
    }

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
    // target: "universe" or "director"
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

  // 6→9 logic: key must contain '6' and '9', and '9' must come AFTER '6'
  unlockPremium() {
    const key = document.getElementById("premium-key").value.trim();
    if (!key) return;

    const idx6 = key.indexOf("6");
    const idx9 = key.indexOf("9");

    const valid =
      idx6 !== -1 &&
      idx9 !== -1 &&
      idx9 > idx6; // 6 brings 9, 9 follows 6

    if (!valid) {
      // fail: no unlock
      sfx.error.play().catch(() => {});
      return;
    }

    // success: unlock based on target
    if (pendingPremiumTarget === "universe") {
      premiumUnlockedUniverse = true;
    } else if (pendingPremiumTarget === "director") {
      premiumUnlockedDirector = true;
    }

    UI.closePremium();
    sfx.success.play().catch(() => {});

    if (pendingPremiumTarget === "universe") {
      UI.show("universe");
    } else if (pendingPremiumTarget === "director") {
      UI.show("director");
    }
  }
};

// initial state
UI.show("login");

