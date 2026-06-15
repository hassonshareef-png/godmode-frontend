// ===============================
// CORE HELPERS
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
// LOGIN
// ===============================
function login() {
  const user = $("login-user").value.trim();
  const pass = $("login-pass").value.trim();

  if (!user || !pass) {
    $("login-error").textContent = "Enter username and password.";
    return;
  }

  if (user === "admin" && pass === "8118") {
    $("login-error").textContent = "";
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
// FREE MODE (LOWEST LEVEL, MANUAL)
// ===============================
function enterFree() {
  showMode("free-mode-screen");
}

// Generator with your 6→9 rule
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
// GOD MODE (MID LEVEL, SEMI-AUTO)
// ===============================
const GOD_LAST_DRAW = [7, 14, 22, 31, 36];

function enterGod() {
  showMode("god-mode-screen");
  // User presses buttons here – no auto
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
// UNIVERSE MODE (AUTO COSMIC, ONE LEVEL BELOW DIRECTOR)
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

function universeCosmicDrift() {
  console.log("🌌 Cosmic Drift: ACTIVE");
}

function universeCosmicMirror() {
  console.log("🪞 Cosmic Mirror: ACTIVE");
}

function universeCosmicVibration() {
  console.log("🔢 Cosmic Digit Vibration: MEDIUM");
}

function universeCosmicPrediction() {
  console.log("🔮 Cosmic Prediction Engine: ACTIVE");
}

function universeCosmicRundown() {
  console.log("📊 Cosmic Rundown (using God Mode rundown, no Earth sync).");
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
// DIRECTOR MODE (TOP LEVEL, AUTO EARTH-SYNCED)
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

// Earth engines
function earthRotationEngine() {
  console.log("🌍 Earth Rotation Engine: ACTIVE");
  console.log("Phase:", getEarthPhase());
  console.log("Rotation Drift:", getEarthRotationDrift());
}

function earthDriftEngine() {
  console.log("📈 Earth Drift Engine: ACTIVE");
}

function earthMirrorEngine() {
  console.log("🪞 Earth Mirror Window: ACTIVE");
}

function earthPressureEngine() {
  console.log("⚡ Earth Pressure: DOUBLE RELEASE ACTIVE");
}

function earthSumEngine() {
  console.log("➕ Earth Sum Drift: +1 ASCENDING");
}

function earthDigitVibration() {
  console.log("🔢 Earth Digit Vibration: HIGH FREQUENCY");
}

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

// Director prediction compiler
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
      `Compiled Prediction → [${base.join(", ")}] | Phase: ${phase}, Drift: ${drift}, ` +
      `Weight: ${directorState.probabilityWeight}%, Seed: ${directorState.seed || "none"}`;
  }
}

function directorConsoleBoot() {
  console.log("🎛️ Director Console Booted");
}

// ===============================
// UPGRADE BUTTON (GLOBAL)
// ===============================
function upgrade() {
  window.open("https://buy.stripe.com/4gMfZh8Kr19D3kUdvRc7u03", "_blank");
}
