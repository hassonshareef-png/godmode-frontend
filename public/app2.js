const API = "https://godmode-backend2.onrender.com";

const UI = {
  show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    document.getElementById(id + "-screen").classList.remove("hidden");
  },

  async login() {
    const user = login-user.value;
    const pass = login-pass.value;

    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await res.json();

    if (data.error) {
      login-error.innerText = data.error;
    } else {
      UI.show("home");
    }
  },

  async backendPrediction(outputId) {
    const res = await fetch(`${API}/predict`);
    const data = await res.json();
    document.getElementById(outputId).innerText = JSON.stringify(data, null, 2);
  },

  quickPick() {
    const nums = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join("");
    free-output.innerText = nums;
  },

  director() {
    const seed = director-seed.value;
    director-output.innerText = `Director Seed Processed: ${seed}`;
  },

  pick3() {
    const v = pick3-input.value;
    pick3-output.innerText = `Pick 3 processed: ${v}`;
  },

  pick4() {
    const v = pick4-input.value;
    pick4-output.innerText = `Pick 4 processed: ${v}`;
  }
};

};

