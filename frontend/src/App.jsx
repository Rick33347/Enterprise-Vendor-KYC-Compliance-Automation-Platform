import { useEffect, useState } from "react";
import DocumentUpload from "./components/DocumentUpload";
import ComplianceScore from "./components/ComplianceScore";
import "./App.css";

export default function App() {
  const [latestReport, setLatestReport] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleEvaluationComplete = (report) => {
    setLatestReport(report);
    fetchHistory(); // Refresh audit history table from SQLite
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Enterprise Vendor eKYC & Compliance</h1>
        <p>Automated PDF Extraction & Deterministic Rule Engine</p>
      </header>

      <main className="main-grid">
        <DocumentUpload onEvaluationComplete={handleEvaluationComplete} />
        <ComplianceScore report={latestReport} />
      </main>

      <section className="card history-card">
        <h2>Evaluation Audit History</h2>
        {history.length === 0 ? (
          <p className="subtitle">No documents evaluated yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Filename</th>
                <th>Organization</th>
                <th>Doc Type</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.filename}</td>
                  <td>{item.organization_name || "N/A"}</td>
                  <td>{item.document_type}</td>
                  <td>{item.compliance_score}/100</td>
                  <td>
                    <span className={`status-pill status-${item.status.toLowerCase()}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}