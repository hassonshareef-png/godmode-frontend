/* ============================
   GODMODE++ FRONTEND LOGIC
   CLEAN VERSION – DIRECTOR MODE PASSWORD RESTORED
   NO 6→9 RULE ANYWHERE
   NOTHING ELSE REMOVED
   ============================ */

const API = "https://godmode-backend2.onrender.com";

// UI helper
const UI = {
    showScreen(id) {
        document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
        document.getElementById(id).style.display = "block";
    },

    setLoading(state) {
        const loader = document.getElementById("loader");
        loader.style.display = state ? "flex" : "none";
    },

    showError(msg) {
        alert(msg);
    }
};

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    UI.setLoading(true);

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await res.json();
        UI.setLoading(false);

        if (data.error) {
            UI.showError(data.error);
            return;
        }

        UI.showScreen("homeScreen");

    } catch (err) {
        UI.setLoading(false);
        UI.showError("Network error");
    }
});

// FREE MODE
document.getElementById("freeModeBtn").addEventListener("click", () => {
    UI.showScreen("freeModeScreen");
});

// GOD MODE
document.getElementById("godModeBtn").addEventListener("click", () => {
    UI.showScreen("godModeScreen");
});

// UNIVERSE MODE (NO LOCK)
document.getElementById("universeModeBtn").addEventListener("click", () => {
    UI.showScreen("universeModeScreen");
});

// DIRECTOR MODE (PASSWORD RESTORED)
document.getElementById("directorModeBtn").addEventListener("click", () => {
    const pass = prompt("Enter Director Password:");

    if (pass !== "8118") {
        alert("Incorrect Director Password");
        return;
    }

    UI.showScreen("directorModeScreen");
});

// PICK 3
document.getElementById("pick3Btn").addEventListener("click", () => {
    UI.showScreen("pick3Screen");
});

// PICK 4
document.getElementById("pick4Btn").addEventListener("click", () => {
    UI.showScreen("pick4Screen");
});

// BACK BUTTONS
document.querySelectorAll(".backHome").forEach(btn => {
    btn.addEventListener("click", () => UI.showScreen("homeScreen"));
});
l(".backHome").forEach(btn => {
    btn.addEventListener("click", () => UI.showScreen("homeScreen"));
});
