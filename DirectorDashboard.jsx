export default function DirectorDashboard() {
    return (
        <div className="director-dashboard">
            <h1>Director Control Panel</h1>

            <div className="mode-buttons">
                <button onClick={() => window.location.href="/basic"}>Basic Mode</button>
                <button onClick={() => window.location.href="/god"}>God Mode</button>
                <button onClick={() => window.location.href="/universe"}>Universe Mode</button>
            </div>

            <div className="admin-tools">
                <button onClick={() => window.location.href="/admin/settings"}>System Settings</button>
                <button onClick={() => window.location.href="/admin/users"}>User Management</button>
                <button onClick={() => window.location.href="/admin/pricing"}>Pricing Control</button>
            </div>
        </div>
    );
}

