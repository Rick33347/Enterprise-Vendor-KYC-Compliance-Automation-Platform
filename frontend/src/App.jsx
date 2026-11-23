import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import HistoryPage from "./pages/HistoryPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

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

  const handleSelectHistoryItem = (item) => {
    setSelectedReport({
      id: item.id,
      filename: item.filename,
      created_at: item.created_at,
      status: item.status,
      compliance_score: item.compliance_score,
      flags: item.flags || [],
      extracted_data: {
        organization_name: item.organization_name,
        document_type: item.document_type,
        important_dates: item.important_dates || [],
        confidence_score: item.confidence_score,
      },
    });
    setActivePage("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEvaluationComplete = (report) => {
    setSelectedReport(report);
    fetchHistory();
    setActivePage("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        historyCount={history.length}
      />

      <main className="main-workspace">
        {activePage === "dashboard" && (
          <DashboardPage
            history={history}
            onNavigate={setActivePage}
            onSelectReport={handleSelectHistoryItem}
          />
        )}

        {activePage === "upload" && (
          <UploadPage onEvaluationComplete={handleEvaluationComplete} />
        )}

        {activePage === "history" && (
          <HistoryPage
            history={history}
            onSelectReport={handleSelectHistoryItem}
          />
        )}

        {activePage === "report" && (
          <ReportDetailPage
            report={selectedReport}
            onBack={() => setActivePage("history")}
          />
        )}
      </main>
    </div>
  );
}