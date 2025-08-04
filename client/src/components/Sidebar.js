import React, { useState } from 'react';
import axios from 'axios';

const Sidebar = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSummary('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSummary('');
  };

  const handleGenerateSummary = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/summarize-pdf",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error generating summary:", error.message);
      alert("Failed to summarize. Try another file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-sidebar" style={{ paddingBottom: "1rem" }}>
      <h4 className="mb-4">Course Progress</h4>

      <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
          <span>Progress</span>
          <span>35% Complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: '35%' }}></div>
        </div>
      </div>

      <div className="course-details mb-4">
        <div className="mb-3">
          <h6 className="text-muted">Duration</h6>
          <p>6 weeks</p>
        </div>
        <div className="mb-3">
          <h6 className="text-muted">Level</h6>
          <p>Beginner</p>
        </div>
        <div className="mb-3">
          <h6 className="text-muted">Language</h6>
          <p>English</p>
        </div>
      </div>

      <button className="btn btn-primary w-100 mb-4">Continue Learning</button>

      {/* PDF Summarization Panel */}
      <div className="pdf-summarizer border-top pt-3">
        <h5 className="mb-3">📄 PDF Summary</h5>

        <input type="file" accept=".pdf" onChange={handleFileChange} className="form-control mb-2" />

        {selectedFile && (
          <div className="mb-2">
            <small>Selected: {selectedFile.name}</small>
            <br />
            <button className="btn btn-sm btn-link text-danger p-0" onClick={handleRemoveFile}>
              ❌ Remove File
            </button>
          </div>
        )}

        <button
          className="btn btn-outline-success w-100 mb-3"
          onClick={handleGenerateSummary}
          disabled={!selectedFile || loading}
        >
          {loading ? '⏳ Generating...' : '✨ Generate Summary'}
        </button>

        {summary && (
          <div>
            <label htmlFor="summaryTextArea"><strong>Summary:</strong></label>
            <textarea
              id="summaryTextArea"
              rows={8}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="form-control mt-2"
              style={{ resize: 'vertical' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
