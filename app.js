const API_BASE_URL = "https://godmode-backend2.onrender.com";

const hasAxios = typeof axios !== "undefined";

class GodModeAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, method = "GET", body = null) {
        const url = `${this.baseURL}${endpoint}`;

        if (hasAxios) {
            try {
                const res = await axios({
                    url,
                    method,
                    data: body,
                    headers: { "Content-Type": "application/json" }
                });
                return res.data;
            } catch (err) {
                console.warn("Axios failed, switching to fetch:", err);
            }
        }

        const fetchOptions = {
            method,
            headers: { "Content-Type": "application/json" }
        };
<div id="output" style="margin-top:20px; font-size:18px; color:#00ff99;"></div>
 if (body) fetchOptions.body = JSON.stringify(body);

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    }

    login(username, password) {
        return this.request("/auth/login", "POST", {
            username,
            password
        });
    }

    checkPremium(userId) {
        return this.request(`/premium/verify/${userId}`, "GET");
    }

    getPrediction(state) {
        return this.request(`/predict/${state}`, "GET");
    }

    health() {
        return this.request("/health", "GET");
    }
}

const GODMODE = new GodModeAPI(API_BASE_URL);

async function testConnection() {
async function testConnection() {
    const output = document.getElementById("output");

    output.innerHTML = "Checking backend…";

    try {
        const res = await GODMODE.health();
        output.innerHTML = "Backend is alive: " + JSON.stringify(res);
    } catch (err) {
        output.innerHTML = "Backend unreachable: " + err.message;
    }
}
}

testConnection();
