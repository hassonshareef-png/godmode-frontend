import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DIRECTOR_PASSWORD = "8118118";   // your new director password

export default function DirectorAuth() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        if (password === DIRECTOR_PASSWORD) {
            navigate("/director-dashboard");   // unlock everything
        } else {
            setError("Access Denied");
        }
    }

    return (
        <div className="director-auth-container">
            <h1>Director Mode</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Enter Director Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Enter</button>
            </form>

            {error && <p className="error">{error}</p>}
        </div>
    );
}

