import RuleFlag from "../components/RuleFlag";
import { exportReportToPDF } from "../utils/pdfExport";

export default function ReportDetailPage({ report, onBack }) {
  if (!report) {
    return (
      <div className="page-content">
        <div className="card empty-state">
          <h3>No report selected</h3>
          <button type="button" className="btn-secondary" onClick={onBack}>
            ← Back to Audit History
          </button>
        </div>
      </div>
    );
  }

  const score = report.compliance_score;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor =
    score >= 80 ? "#8D957E" : score >= 50 ? "#B86B24" : "#984216";

  const formattedTime = report.created_at
    ? new Date(report.created_at).toLocaleString()
    : "Just now";

  return (
    <div className="page-content">
      <div className="report-topbar">
        <button type="button" className="btn-link" onClick={onBack}>
          ← Back to Audit History
        </button>
        <button
          type="button"
          className="btn-primary btn-inline"
          onClick={() => exportReportToPDF(report)}
        >
          ⬇ Download PDF Report
        </button>
      </div>

      <div className="card">
        <div className="result-header">
          <div>
            <div className="title-row">
              <h1>{report.extracted_data.organization_name || "Unknown Organization"}</h1>
              <span className={`status-pill status-${report.status.toLowerCase()}`}>
                {report.status.replace("_", " ")}
              </span>
            </div>
            <p className="subtitle">
              {report.filename || "Uploaded Document"}
              {report.id ? ` • Audit Record #${report.id}` : ""}
            </p>
          </div>
        </div>

        <div className="score-overview">
          <div className="score-ring-wrapper">
            <svg width="104" height="104">
              <circle
                cx="52"
                cy="52"
                r={radius}
                stroke="#E4D6C5"
                strokeWidth="9"
                fill="none"
              />
              <circle
                cx="52"
                cy="52"
                r={radius}
                stroke={ringColor}
                strokeWidth="9"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 52 52)"
              />
            </svg>
            <div className="score-ring-text">
              <span>{score}</span>
              <small>/100</small>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">AI Extraction Confidence</span>
              <span className="metric-value">
                {report.extracted_data.confidence_score}%
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Document Type</span>
              <span className="metric-value">
                {report.extracted_data.document_type}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Dates Identified</span>
              <span className="metric-value">
                {report.extracted_data.important_dates?.join(", ") || "None"}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Audit Timestamp</span>
              <span className="metric-value">{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="flags-section">
          <h3>Compliance Audit Flags ({report.flags.length})</h3>
          {report.flags.length === 0 ? (
            <p className="no-flags">✓ All compliance checks passed with zero flags.</p>
          ) : (
            report.flags.map((flag, idx) => <RuleFlag key={idx} flag={flag} />)
          )}
        </div>
      </div>
    </div>
  );
}