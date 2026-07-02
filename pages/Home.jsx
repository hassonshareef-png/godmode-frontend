import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1>GODMODE++</h1>

            <div className="mode-buttons">
                <button onClick={() => navigate("/basic")}>
                    Basic Mode – Free
                </button>

                <button onClick={() => navigate("/purchase/god")}>
                    God Mode – $4.99
                </button>

                <button onClick={() => navigate("/purchase/universe")}>
                    Universe Mode – $9.99
                </button>

                <button onClick={() => navigate("/director-auth")}>
                    Director Mode – Admin
                </button>
            </div>
        </div>
    );
}
