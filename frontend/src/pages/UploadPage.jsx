import { useState } from "react";

export default function UploadPage({ onEvaluationComplete }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilePick = (pickedFile) => {
    setError("");
    if (pickedFile && !pickedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      setFile(null);
      return;
    }
    setFile(pickedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilePick(e.dataTransfer.files[0]);
    }
  };

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
      onEvaluationComplete({
        ...data,
        filename: file.name,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <span className="badge-tag">New Evaluation</span>
          <h1>Upload Vendor KYC Document</h1>
          <p className="subtitle">
            Submit a vendor PDF (Invoices, GST, PAN, Licenses, Contracts) for automated compliance scoring.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="card upload-panel">
        <div
          className={`dropzone ${dragActive ? "dropzone-active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="dropzone-icon">📄</div>
          <h3>{file ? file.name : "Drag & drop your PDF here"}</h3>
          <p className="subtitle">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB • Ready to evaluate`
              : "or browse from your computer (PDF only)"}
          </p>

          <label className="btn-secondary browse-btn">
            {file ? "Change File" : "Browse PDF"}
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => handleFilePick(e.target.files[0])}
            />
          </label>
        </div>

        <button type="submit" disabled={loading || !file} className="btn-primary">
          {loading ? "Evaluating Document..." : "Run Compliance Evaluation"}
        </button>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}