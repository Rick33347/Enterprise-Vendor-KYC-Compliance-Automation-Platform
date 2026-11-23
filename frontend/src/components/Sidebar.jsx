export default function Sidebar({ activePage, onNavigate, historyCount }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◫" },
    { id: "upload", label: "Upload & Evaluate", icon: "↑" },
    { id: "history", label: "Audit History", icon: "☰", badge: historyCount },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">eKYC</div>
        <div>
          <div className="brand-title">Vendor Compliance</div>
          <div className="brand-sub">Enterprise Audit Suite</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge !== undefined && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        <span>FastAPI Backend Connected</span>
      </div>
    </aside>
  );
}