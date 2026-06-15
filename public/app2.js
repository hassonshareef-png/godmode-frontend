[PASTE START]

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
  const user = $("login-user").value.trim();
  const pass = $("login-pass").value.trim();

  if (!user || !pass) {
    $("login-error").textContent = "Enter username and password.";
    return;
  }

  // MASTER LOGIN
  if (user === "admin" && pass === "8118") {
    $("login-error").textContent = "";

    // ⭐ UNLOCK EVERYTHING ⭐
    document.querySelectorAll(".locked").forEach(el => {
      el.classList.remove("locked");
      const btn = el.querySelector("button");
      if (btn) btn.disabled = false;
    });

    showMode("home-screen");
  } else {
    $("login-error").textContent = "Incorrect username or password.";
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
}

function generateQuickPick() {
  const picks = [];
  while (picks.length < 5) {
    const n = Math.floor(Math.random() * 39) + 1;
    if (!picks.includes(n)) picks.push(n);
  }

  if (picks.includes(6) && !picks.includes(9)) {
    let idx = Math.floor(Math.random() * picks.length);
    if (picks[idx] === 6) idx = (idx + 1) % picks.length;
    picks[idx] = 9;
  }

  picks.sort((a, b) => a - b);
  alert("Generated (6→9): " + picks.join(", "));
}

// ===============================
// GOD MODE
// ===============================
const GOD_LAST_DRAW = [7, 14, 22, 31, 36];

function enterGod() {
  showMode("god-mode-screen");
}

function digitRoot(n) {
  const s = n.toString().split("").reduce((a, d) => a + Number(d), 0);
  return s % 10;
}

function mirrorNumber(n) {
  return 40 - n;
}

function applySixBringsNine(list) {
  if (list.includes(6) && !list.includes(9)) list.push(9);
  return list;
}

function runGodRundown() {
  const breakdown = [];

  GOD_LAST_DRAW.forEach(n => {
    const mirror = mirrorNumber(n);
    const root = digitRoot(n);
    let specials = [root];
    specials = applySixBringsNine(specials);

    const anchors = [];
    if (specials.includes(0)) anchors.push(0);
    if (specials.includes(5)) anchors.push(5);

    breakdown.push({
      base: n,
      mirror,
      root,
      specials: [...new Set(specials)].sort((a, b) => a - b),
      anchors
    });
  });

  const lines = breakdown.map(item => {
    return `#${item.base} → mirror ${item.mirror}, root ${item.root}, specials [${item.specials.join(", ")}], anchors [${item.anchors.length ? item.anchors.join(", ") : "none"}]`;
  });

  const out = $("god-rundown-output");
  if (out) out.textContent = lines.join(" | ");
}

// ===============================
// UNIVERSE MODE
// ===============================
function enterUniverse() {
  showMode("universe-mode-screen");
  document.body.classList.add("universe-mode");

  universeCosmicDrift();
  universeCosmicMirror();
  universeCosmicVibration();
  universeCosmicPrediction();
  universeCosmicRundown();
  universeCosmicGenerator();
  universeFX();
}

function exitUniverse() {
  document.body.classList.remove("universe-mode");
  showMode("home-screen");
}

function universeCosmicDrift() { console.log("🌌 Cosmic Drift: ACTIVE"); }
function universeCosmicMirror() { console.log("🪞 Cosmic Mirror: ACTIVE"); }
function universeCosmicVibration() { console.log("🔢 Cosmic Digit Vibration: MEDIUM"); }
function universeCosmicPrediction() { console.log("🔮 Cosmic Prediction Engine: ACTIVE"); }

function universeCosmicRundown() {
  console.log("📊 Cosmic Rundown (using God Mode rundown).");
  runGodRundown();
}

function universeCosmicGenerator() {
  console.log("🎲 Cosmic Generator (using 6→9 logic).");
  generateQuickPick();
}

function universeFX() {
  console.log("🌌 Universe FX: warp visuals.");
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
  $("director-modal").classList.remove("hidden");
}

function closeDirector() {
  $("director-modal").classList.add("hidden");
}

function unlockDirector() {
  const code = $("director-pass").value.trim();

  if (code === "8118") {
    $("director-modal").classList.add("hidden");
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
  directorAutoEngine();
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

function directorAutoEngine() {
  updateDirectorOverrides();
  earthRotationEngine();
  earthTimingPredictionOutput();
  earthDriftEngine();
  earthMirrorEngine();
  earthPressureEngine();
  earthSumEngine();
  earthDigitVibration();
  runGodRundown();
  generateQuickPick();
  universeFX();
  directorConsoleBoot();
}

function earthRotationEngine() { console.log("🌍 Earth Rotation Engine: ACTIVE"); }
function earthDriftEngine() { console.log("📈 Earth Drift Engine: ACTIVE"); }
function earthMirrorEngine() { console.log("🪞 Earth Mirror Window: ACTIVE"); }
function earthPressureEngine() { console.log("⚡ Earth Pressure: DOUBLE RELEASE ACTIVE"); }
function earthSumEngine() { console.log("➕ Earth Sum Drift: +1 ASCENDING"); }
function earthDigitVibration() { console.log("🔢 Earth Digit Vibration: HIGH FREQUENCY"); }

function getEarthPhase() {
  const phases = ["Opening", "Rising", "Peak", "Falling", "Reset"];
  return phases[Math.floor(Math.random() * phases.length)];
}

function getEarthRotationDrift() {
  const drift = [-2, -1, 0, +1, +2];
  return drift[Math.floor(Math.random() * drift.length)];
}

function earthTimingPredictionOutput() {
  const phase = getEarthPhase();
  const drift = getEarthRotationDrift();
  const out = $("director-earth-output");

  let text = `Phase: ${phase}, Drift: ${drift}`;
  if (directorState.overrideEarth) text += " | Earth override: ACTIVE";

  if (out) out.textContent = text;
}

function compileDirectorPrediction() {
  updateDirectorOverrides();

  const phase = getEarthPhase();
  const drift = getEarthRotationDrift();
  let base = [...GOD_LAST_DRAW];

  base = base.map(n => n + drift);

  if (directorState.seed) {
    const seedNum = Number(directorState.seed) || 0;
    base = base.map(n => n + (seedNum % 10));
  }

  const weight = directorState.probabilityWeight / 100;
  base = base.map(n => Math.round(n * weight));

  base = base.map(n => {
    if (n < 1) return 1;
    if (n > 39) return 39;
    return n;
  });

  if (base.includes(6) && !base.includes(9)) base.push(9);

  base = [...new Set(base)].sort((a, b) => a - b);

  const out = $("director-prediction-output");
  if (out) {
    out.textContent =
      `Compiled Prediction → [${base.join(", ")}] | Phase: ${phase}, Drift: ${drift}, Weight: ${directorState.probabilityWeight}%, Seed: ${directorState.seed || "none"}`;
  }
}

function directorConsoleBoot() {
  console.log("🎛️ Director Console Booted");
}

// ===============================
// UPGRADE BUTTON
// ===============================
function upgrade() {
  window.open("https://buy.stripe.com/4gMfZh8Kr19D3kUdvRc7u03", "_blank");
}

// ===============================
// PICK 3 + PICK 4 ENGINE
// ===============================
const pickHistory = [];

function addResult(mode) {
  const input = $("pick-input");
  if (!input) return;

  const raw = input.value.trim();
  if (!raw || (raw.length !== 3 && raw.length !== 4)) {
    alert("Enter a 3-digit (Pick 3) or 4-digit (Pick 4) result.");
    return;
  }

  const digits = raw.split("").map(Number);
  const type = digits.length === 3 ? "P3" : "P4";

  pickHistory.push({ type, digits, mode });

  runUnifiedEngine(mode, digits, type);
}

function runUnifiedEngine(mode, digits, type) {
  const grids = buildUnifiedGrids(digits, type);
  runUnifiedStrategies(mode, grids, digits, type);
  updateUnifiedUI(grids, digits, type, mode);
}

function buildUnifiedGrids(digits, type) {
  const sum = digits.reduce((a, d) => a + d, 0);
  const root = sum % 10;

  return {
    grid9: { level: 9, digits, sum, root },
    grid8: {
      level: 8,
      pairs:
        type === "P4"
          ? [digits[0] + digits[1], digits[2] + digits[3]]
          : [digits[0] + digits[1], digits[1] + digits[2]]
    },
    grid7: { level: 7, mirrors: digits.map(d => 9 - d) },
    grid6: { level: 6, drift: digits.map(d => d + 1) },
    grid5: {
      level: 5,
      anchors:
        type === "P4" ? [digits[0], digits[3]] : [digits[0], digits[2]]
    },
    grid4: {
      level: 4,
      ticTacToe: buildUnifiedTicTacToeGrid(digits, type)
    },
    grid3: {
      level: 3,
      mini:
        type === "P4" ? [digits[1], digits[2]] : [digits[0], digits[1]]
    },
    grid2: {
      level: 2,
      finalPair:
        type === "P4" ? [digits[2], digits[3]] : [digits[1], digits[2]]
    }
  };
}

function buildUnifiedTicTacToeGrid(digits, type) {
  const base = type === "P4" ? digits.slice(0, 3) : digits;
  const plus3 = base.map(d => (d + 3) % 10);
  const plus6 = base.map(d => (d + 6) % 10);

  return [
    [base[0], plus3[0], plus6[0]],
    [base[1], plus3[1], plus6[1]],
    [base[2], plus3[2], plus6[2]]
  ];
}

function runUnifiedStrategies(mode, grids, digits, type) {
  const sum = grids.grid9.sum;

  const isHighSum = sum >= (type === "P4" ? 20 : 15);
  const isLowSum = sum <= (type === "P4" ? 10 : 7);

  const consecutive =
    Math.abs(digits[1] - digits[0]) === 1 ||
    Math.abs(digits[digits.length - 1] - digits[digits.length - 2]) === 1;

  const repeats =
    new Set(digits).size !== digits.length;

  const strategyList = [];

  if (isHighSum) strategyList.push("Use +9 Workout");
  if (isLowSum) strategyList.push("Use +3 Workout");
  if (!isHighSum && !isLowSum) strategyList.push("Use +6 Workout");

  if (consecutive) strategyList.push("1-Ups / 1-Downs");
  if (repeats) strategyList.push("Traveling Numbers");

  strategyList.push("9-Grid Scan");
  strategyList.push("8-Grid Compression");
  strategyList.push("7-Grid Mirror");
  strategyList.push("6-Grid Drift");
  strategyList.push("5-Grid Anchors");
  strategyList.push("4-Grid Tic Tac Toe");
  strategyList.push("3-Grid Micro Pattern");
  strategyList.push("2-Grid Final Pair");

  const out = $("pick-strategy-output");
  if (out) {
    out.textContent =
      `${type === "P3" ? "Pick 3" : "Pick 4"} Strategies → ${strategyList.join(" | ")}`;
  }
}

function updateUnifiedUI(grids, digits, type, mode) {
  const label = type === "P3" ? "Pick 3" : "Pick 4";

  if ($("grid9-output"))
    $("grid9-output").textContent =
      `${label} 9-Grid → sum ${grids.grid9.sum}, root ${grids.grid9.root}`;

  if ($("grid8-output"))
    $("grid8-output").textContent =
      `${label} 8-Grid → pairs [${grids.grid8.pairs.join(", ")}]`;

  if ($("grid7-output"))
    $("grid7-output").textContent =
      `${label} 7-Grid → mirrors [${grids.grid7.mirrors.join(", ")}]`;

  if ($("grid6-output"))
    $("grid6-output").textContent =
      `${label} 6-Grid → drift [${grids.grid6.drift.join(", ")}]`;

  if ($("grid5-output"))
    $("grid5-output").textContent =
      `${label} 5-Grid → anchors [${grids.grid5.anchors.join(", ")}]`;

  if ($("grid4-output")) {
    const ttt = grids.grid4.ticTacToe.map(r => r.join(" ")).join(" | ");
    $("grid4-output").textContent =
      `${label} 4-Grid (Tic Tac Toe) → ${ttt}`;
  }

  if ($("grid3-output"))
    $("grid3-output").textContent =
      `${label} 3-Grid → mini [${grids.grid3.mini.join(", ")}]`;

  if ($("grid2-output"))
    $("grid2-output").textContent =
      `${label} 2-Grid → final pair [${grids.grid2.finalPair.join(", ")}]`;
}

[PASTE END]
