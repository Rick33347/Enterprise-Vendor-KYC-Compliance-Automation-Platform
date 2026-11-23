import RuleFlag from "./RuleFlag";

export default function ComplianceScore({ report }) {
  if (!report) return null;

  const statusClass = `status-pill status-${report.status.toLowerCase()}`;

  return (
    <div className="card result-card">
      <div className="result-header">
        <div>
          <h2>Compliance Report</h2>
          <p className="subtitle">{report.extracted_data.organization_name || "Unknown Organization"}</p>
        </div>
        <span className={statusClass}>{report.status.replace("_", " ")}</span>
      </div>

      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Compliance Score</span>
          <span className="metric-value">{report.compliance_score} / 100</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">AI Confidence</span>
          <span className="metric-value">{report.extracted_data.confidence_score}%</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Document Type</span>
          <span className="metric-value">{report.extracted_data.document_type}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Dates Found</span>
          <span className="metric-value">
            {report.extracted_data.important_dates?.join(", ") || "None"}
          </span>
        </div>
      </div>

      <div className="flags-section">
        <h3>Compliance Flags ({report.flags.length})</h3>
        {report.flags.length === 0 ? (
          <p className="no-flags">All compliance rules passed with zero flags.</p>
        ) : (
          report.flags.map((flag, idx) => <RuleFlag key={idx} flag={flag} />)
        )}
      </div>
    </div>
  );
}