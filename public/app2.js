/* ============================
   GODMODE++ FRONTEND – FINAL VERSION
   Matches your HTML exactly
   Premium badges + PWA install + Engines
   ============================ */

const API = "https://godmode-backend2.onrender.com";

let session = {
  loggedIn: false,
  god: false,
  universe: false
};

/* ============================
   SCREEN SWITCHING
   ============================ */
const UI = {
  show(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screen + "-screen").classList.add("active");
  },

  /* LOGIN */
  async login() {
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value.trim();

    if (!user || !pass) {
      alert("Enter username and password.");
      return;
    }

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      session.loggedIn = true;
      session.god = !!data.god;
      session.universe = !!data.universe;

      updateBadges();
      UI.show("home");

    } catch (err) {
      alert("Network error.");
    }
  },

  /* QUICK PICK */
  quickPick() {
    const out = document.getElementById("free-output");
    out.textContent = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  },

  /* BACKEND PREDICTION */
  async backendPrediction(outputId, premium = false) {
    if (premium && !session.god && !session.universe) {
      alert("Premium required.");
      return;
    }

    const output = document.getElementById(outputId);
    output.textContent = "Contacting engine...";

    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          god: session.god,
          universe: session.universe
        })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        output.textContent = "";
        return;
      }

      output.textContent = data.prediction || JSON.stringify(data, null, 2);

    } catch (err) {
      output.textContent = "Network error.";
    }
  },

  /* DIRECTOR */
  async director() {
    const seed = document.getElementById("director-seed").value.trim();
    const out = document.getElementById("director-output");

    if (!seed) {
      alert("Enter seed.");
      return;
    }

    out.textContent = "Compiling...";

    try {
      const res = await fetch(`${API}/director`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed })
      });

      const data = await res.json();
      out.textContent = data.output || JSON.stringify(data, null, 2);

    } catch (err) {
      out.textContent = "Network error.";
    }
  },

  /* PICK 3 */
  async pick3() {
    const val = document.getElementById("pick3-input").value.trim();
    const out = document.getElementById("pick3-output");

    if (!/^\d{3}$/.test(val)) {
      alert("Enter 3 digits.");
      return;
    }

    out.textContent = "Processing...";

    try {
      const res = await fetch(`${API}/pick3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: val })
      });

      const data = await res.json();
      out.textContent = data.result || JSON.stringify(data, null, 2);

    } catch (err) {
      out.textContent = "Network error.";
    }
  },

  /* PICK 4 */
  async pick4() {
    const val = document.getElementById("pick4-input").value.trim();
    const out = document.getElementById("pick4-output");

    if (!/^\d{4}$/.test(val)) {
      alert("Enter 4 digits.");
      return;
    }

    out.textContent = "Processing...";

    try {
      const res = await fetch(`${API}/pick4`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: val })
      });

      const data = await res.json();
      out.textContent = data.result || JSON.stringify(data, null, 2);

    } catch (err) {
      out.textContent = "Network error.";
    }
  }
};

/* ============================
   PREMIUM BADGES
   ============================ */
function updateBadges() {
  const godHome = document.getElementById("godBadge");
  const uniHome = document.getElementById("universeBadge");

  const godScreen = document.getElementById("godBadge_godScreen");
  const uniScreen = document.getElementById("universeBadge_universeScreen");

  if (godHome) godHome.style.display = session.god ? "inline-block" : "none";
  if (uniHome) uniHome.style.display = session.universe ? "inline-block" : "none";

  if (godScreen) godScreen.style.display = session.god ? "inline-block" : "none";
  if (uniScreen) uniScreen.style.display = session.universe ? "inline-block" : "none";
}

/* ============================
   ANDROID + iPHONE INSTALL
   ============================ */

let deferredPrompt;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;

// ANDROID
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (!isIOS()) {
    document.getElementById("installBtn").style.display = "block";
  }
});

// ANDROID BUTTON
document.getElementById("installBtn")?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

// iPHONE
window.addEventListener("load", () => {
  if (isIOS() && !isStandalone()) {
    document.getElementById("iosInstall").style.display = "block";
  }
});
