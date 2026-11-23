import { useState } from "react";

export default function HistoryPage({ history, onSelectReport }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = history.filter((item) => {
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.filename.toLowerCase().includes(query) ||
      (item.organization_name || "").toLowerCase().includes(query) ||
      item.document_type.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const filters = [
    { key: "ALL", label: "All" },
    { key: "APPROVED", label: "Approved" },
    { key: "REVIEW_REQUIRED", label: "Review Required" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <span className="badge-tag">Audit Trail</span>
          <h1>Evaluation Audit History</h1>
          <p className="subtitle">
            Search, filter, and inspect every vendor document stored in SQLite.
          </p>
        </div>
      </header>

      <section className="card">
        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search by filename, organization, or document type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-pills">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`filter-pill ${statusFilter === f.key ? "active" : ""}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No matching evaluation records found.</p>
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
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
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
                    <td className="timestamp-cell">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "—"}
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