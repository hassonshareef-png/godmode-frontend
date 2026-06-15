// ===============================
// DOM HELPER
// ===============================
function $(id) {
  return document.getElementById(id);
}

function showMode(id) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(s => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

// ===============================
// LOGIN — MASTER UNLOCK
// ===============================
function login() {
  const user = $("login-user")?.value.trim() || "";
  const pass = $("login-pass")?.value.trim() || "";

  if (!user || !pass) {
    if ($("login-error")) $("login-error").textContent = "Enter username and password.";
    return;
  }

  if (user === "admin" && pass === "8118") {
    if ($("login-error")) $("login-error").textContent = "";

    document.querySelectorAll(".locked").forEach(el => {
      el.classList.remove("locked");
      const btn = el.querySelector("button");
      if (btn) btn.disabled = false;
    });

    showMode("home-screen");
  } else {
    if ($("login-error")) $("login-error").textContent = "Incorrect username or password.";
  }
}

// ===============================
// THEME TOGGLE
// ===============================
function toggleGalaxy() {
  document.body.classList.toggle("galaxy");
  document.body.classList.toggle("light");
}

// ===============================
// FREE MODE
// ===============================
function enterFree() {
  showMode("free-mode-screen");
  loadQuickPick();
}

async function loadQuickPick() {
  try {
    const data = await apiQuickPick();
    if ($("free-output")) {
      $("free-output").textContent = `Quick Pick (6→9) → [${data.numbers.join(", ")}]`;
    }
  } catch (e) {
    console.error(e);
    if ($("free-output")) $("free-output").textContent = "Quick Pick error.";
  }
}

// ===============================
// GOD MODE
// ===============================
function enterGod() {
  showMode("god-mode-screen");
  runGodRundown();
}

async function runGodRundown() {
  try {
    const data = await apiGodRundown();
    if ($("god-rundown-output")) {
      $("god-rundown-output").textContent = data.output || "No rundown data.";
    }
  } catch (e) {
    console.error(e);
    if ($("god-rundown-output")) $("god-rundown-output").textContent = "Rundown error.";
  }
}

// ===============================
// UNIVERSE MODE
// ===============================
function enterUniverse() {
  showMode("universe-mode-screen");
  document.body.classList.add("universe-mode");
  runUniverseEngine();
}

function exitUniverse() {
  document.body.classList.remove("universe-mode");
  showMode("home-screen");
}

async function runUniverseEngine() {
  try {
    const data = await apiUniverse();
    if ($("universe-output")) {
      $("universe-output").textContent = data.output || "Universe engine ready.";
    }
  } catch (e) {
    console.error(e);
    if ($("universe-output")) $("universe-output").textContent = "Universe error.";
  }
}

// ===============================
// DIRECTOR MODE
// ===============================
const directorState = {
  overrideEarth: false,
  overrideUniverse: false,
  probabilityWeight: 50,
  seed: null
};

function openDirector() {
  $("director-modal")?.classList.remove("hidden");
}

function closeDirector() {
  $("director-modal")?.classList.add("hidden");
}

function unlockDirector() {
  const code = $("director-pass")?.value.trim() || "";

  if (code === "8118") {
    $("director-modal")?.classList.add("hidden");
    document.body.classList.add("director-mode", "unlock-anim");
    enterDirectorMode();
    setTimeout(() => {
      document.body.classList.remove("unlock-anim");
    }, 1500);
  } else {
    alert("Incorrect passcode.");
  }
}

function enterDirectorMode() {
  showMode("director-mode-screen");
  directorConsoleBoot();
  updateDirectorOverrides();
  compileDirectorPrediction();
}

function updateDirectorOverrides() {
  const earthBox = $("override-earth");
  const universeBox = $("override-universe");
  const slider = $("probability-slider");
  const seedInput = $("director-seed");
  const probLabel = $("probability-value");

  if (earthBox) directorState.overrideEarth = earthBox.checked;
  if (universeBox) directorState.overrideUniverse = universeBox.checked;
  if (slider) {
    directorState.probabilityWeight = Number(slider.value);
    if (probLabel) probLabel.textContent = slider.value + "%";
  }
  if (seedInput) directorState.seed = seedInput.value.trim() || null;
}

async function compileDirectorPrediction() {
  updateDirectorOverrides();

  const payload = {
    overrideEarth: directorState.overrideEarth,
    overrideUniverse: directorState.overrideUniverse,
    probabilityWeight: directorState.probabilityWeight,
    seed: directorState.seed
  };

  try {
    const data = await apiDirector(payload);
    if ($("director-prediction-output")) {
      $("director-prediction-output").textContent =
        data.output ||
        `Compiled Prediction → [${(data.numbers || []).join(", ")}]`;
    }
    if ($("director-earth-output") && data.earthPhase && data.earthDrift !== undefined) {
      $("director-earth-output").textContent =
        `Phase: ${data.earthPhase}, Drift: ${data.earthDrift}` +
        (directorState.overrideEarth ? " | Earth override: ACTIVE" : "");
    }
  } catch (e) {
    console.error(e);
    if ($("director-prediction-output")) {
      $("director-prediction-output").textContent = "Director prediction error.";
    }
  }
}

function directorConsoleBoot() {
  console.log("🎛️ Director Console Booted (backend-driven)");
}

// ===============================
// UPGRADE BUTTON
// ===============================
function upgrade() {
  window.open("https://buy.stripe.com/4gMfZh8Kr19D3kUdvRc7u03", "_blank");
}

// ===============================
// PICK 3 + PICK 4 ENGINE (BACKEND-ONLY)
// ===============================
const pickHistory = [];

async function addResult(mode) {
  const input = $("pick-input");
  if (!input) return;

  const raw = input.value.trim();
  if (!raw || (raw.length !== 3 && raw.length !== 4)) {
    alert("Enter a 3-digit (Pick 3) or 4-digit (Pick 4) result.");
    return;
  }

  const type = raw.length === 3 ? "P3" : "P4";
  pickHistory.push({ type, digits: raw, mode });

  try {
    const data =
      type === "P3" ? await apiPick3(raw, mode) : await apiPick4(raw, mode);

    if ($("pick-strategy-output")) {
      $("pick-strategy-output").textContent =
        data.strategyText ||
        `${type === "P3" ? "Pick 3" : "Pick 4"} Strategies → ${data.strategies?.join(" | ") || "No strategies."}`;
    }

    if ($("grid9-output") && data.grid9) {
      $("grid9-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 9-Grid → sum ${data.grid9.sum}, root ${data.grid9.root}`;
    }

    if ($("grid8-output") && data.grid8) {
      $("grid8-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 8-Grid → pairs [${data.grid8.pairs.join(", ")}]`;
    }

    if ($("grid7-output") && data.grid7) {
      $("grid7-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 7-Grid → mirrors [${data.grid7.mirrors.join(", ")}]`;
    }

    if ($("grid6-output") && data.grid6) {
      $("grid6-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 6-Grid → drift [${data.grid6.drift.join(", ")}]`;
    }

    if ($("grid5-output") && data.grid5) {
      $("grid5-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 5-Grid → anchors [${data.grid5.anchors.join(", ")}]`;
    }

    if ($("grid4-output") && data.grid4) {
      $("grid4-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 4-Grid (Tic Tac Toe) → ${data.grid4.ticTacToeRows.join(" | ")}`;
    }

    if ($("grid3-output") && data.grid3) {
      $("grid3-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 3-Grid → mini [${data.grid3.mini.join(", ")}]`;
    }

    if ($("grid2-output") && data.grid2) {
      $("grid2-output").textContent =
        `${type === "P3" ? "Pick 3" : "Pick 4"} 2-Grid → final pair [${data.grid2.finalPair.join(", ")}]`;
    }
  } catch (e) {
    console.error(e);
    if ($("pick-strategy-output")) {
      $("pick-strategy-output").textContent = "Pick engine error.";
    }
  }
}

// ===============================
// BACKEND API HELPERS (OPTION C)
// ===============================
const API_BASE = "https://godmode-backend2.onrender.com";

async function apiPick3(digits, mode) {
  const res = await fetch(`${API_BASE}/api/pick3`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ digits, mode })
  });
  if (!res.ok) throw new Error("Pick3 API error");
  return await res.json();
}

async function apiPick4(digits, mode) {
  const res = await fetch(`${API_BASE}/api/pick4`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ digits, mode })
  });
  if (!res.ok) throw new Error("Pick4 API error");
  return await res.json();
}

async function apiGodRundown() {
  const res = await fetch(`${API_BASE}/api/god-rundown`, {
    method: "GET"
  });
  if (!res.ok) throw new Error("God Rundown API error");
  return await res.json();
}

async function apiUniverse() {
  const res = await fetch(`${API_BASE}/api/universe`, {
    method: "GET"
  });
  if (!res.ok) throw new Error("Universe API error");
  return await res.json();
}

async function apiDirector(payload) {
  const res = await fetch(`${API_BASE}/api/director`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Director API error");
  return await res.json();
}

async function apiQuickPick() {
  const res = await fetch(`${API_BASE}/api/quickpick`, {
    method: "GET"
  });
  if (!res.ok) throw new Error("QuickPick API error");
  return await res.json();
}
