export default function DashboardPage({ history, onNavigate, onSelectReport }) {
  const totalCount = history.length;
  const approvedCount = history.filter((h) => h.status === "APPROVED").length;
  const reviewCount = history.filter((h) => h.status === "REVIEW_REQUIRED").length;
  const rejectedCount = history.filter((h) => h.status === "REJECTED").length;
  const recentItems = history.slice(0, 5);

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <span className="badge-tag">Compliance Overview</span>
          <h1>Enterprise Vendor eKYC Dashboard</h1>
          <p className="subtitle">
            Monitor vendor document evaluations, risk scores, and audit outcomes.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary btn-inline"
          onClick={() => onNavigate("upload")}
        >
          + Evaluate Document
        </button>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Audited</span>
          <span className="kpi-value">{totalCount}</span>
        </div>
        <div className="kpi-card kpi-approved">
          <span className="kpi-label">Approved</span>
          <span className="kpi-value">{approvedCount}</span>
        </div>
        <div className="kpi-card kpi-review">
          <span className="kpi-label">Review Required</span>
          <span className="kpi-value">{reviewCount}</span>
        </div>
        <div className="kpi-card kpi-rejected">
          <span className="kpi-label">Rejected</span>
          <span className="kpi-value">{rejectedCount}</span>
        </div>
      </section>

      <section className="card">
        <div className="card-header-row">
          <div>
            <h2>Recent Evaluations</h2>
            <p className="subtitle">Latest vendor documents processed by the platform</p>
          </div>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigate("history")}
          >
            View All History →
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="empty-state">
            <p>No documents evaluated yet. Upload your first vendor PDF to begin.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Filename</th>
                  <th>Organization</th>
                  <th>Doc Type</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className="filename-cell">{item.filename}</td>
                    <td>{item.organization_name || "N/A"}</td>
                    <td>{item.document_type}</td>
                    <td><strong>{item.compliance_score}</strong>/100</td>
                    <td>
                      <span className={`status-pill status-${item.status.toLowerCase()}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-view"
                        onClick={() => onSelectReport(item)}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}