import { useState } from "react";

export default function DocumentUpload({ onEvaluationComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/evaluate-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Evaluation failed.");
      }

      const data = await response.json();
      onEvaluationComplete(data);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card upload-card">
      <h2>Upload Vendor KYC Document</h2>
      <p className="subtitle">Supported format: PDF (Invoices, GST, PAN, Licenses, Contracts)</p>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input"
      />

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Analyzing with AI & Rule Engine..." : "Evaluate Document"}
      </button>

      {error && <p className="error-text">{error}</p>}
    </form>
  );
}