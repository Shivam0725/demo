import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button, ProgressBar, Alert, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';

const Dashboard = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get('name');
  const fileInputRef = useRef(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [serverStatus, setServerStatus] = useState('unknown');
  const [summarizationMeta, setSummarizationMeta] = useState(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await axios.get('http://localhost:5000/health', { timeout: 3000 });
        setServerStatus(response.status === 200 ? 'healthy' : 'unhealthy');
      } catch (error) {
        setServerStatus('unreachable');
      }
    };
    checkServerHealth();
  }, []);

  const generateSummary = async () => {
    if (!pdfFile) {
      setPdfError('Please upload a PDF first');
      return;
    }

    setIsSummarizing(true);
    setPdfError('');
    setSummary('');
    setSummaryInput('');
    setSummarizationMeta(null);

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await axios.post(
        'http://localhost:5000/api/summarize-pdf',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        }
      );

      if (!response.data?.summary) {
        throw new Error(response.data?.message || 'Empty summary received');
      }

      setSummary(response.data.summary);
      setSummaryInput(response.data.summary);
      setSummarizationMeta({
        model: response.data.model || 'OctoAI-Llama2',
        chars: response.data.chars_processed || 'Unknown',
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      let errorMsg = 'Failed to generate summary';
      let solution = '';
      
      if (error.response?.data) {
        errorMsg = error.response.data.error || errorMsg;
        solution = error.response.data.solution || '';
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timed out';
        solution = 'Try a smaller PDF file';
      }
      
      setPdfError(`${errorMsg}. ${solution}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        setPdfError('File size exceeds 10MB limit');
        return;
      }
      setPdfFile(file);
      setPdfName(file.name);
      setSummary('');
      setSummaryInput('');
      setPdfError('');
    } else {
      setPdfError('Please select a valid PDF file');
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfName('');
    setSummary('');
    setSummaryInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Main Dashboard */}
        <div className="col-lg-8 col-md-12">
          <Card className="mb-4">
            <Card.Body className="text-center">
              <h1>Welcome, {name}!</h1>
              <p className="lead">
                {location.pathname.includes('dashboard')
                  ? "You have successfully logged in to your learning dashboard"
                  : "You're enrolled in Introduction to Machine Learning"}
              </p>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Your Learning Progress</Card.Title>
              <div className="my-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Course Completion</span>
                  <span>35% Complete</span>
                </div>
                <ProgressBar now={35} />
              </div>
              <div className="mt-4">
                <h3>Your Learning Dashboard</h3>
                <div className="row mt-3">
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h5>Course Progress</h5>
                        <div className="progress mt-3">
                          <div className="progress-bar" role="progressbar" style={{ width: '35%' }}></div>
                        </div>
                        <p className="mt-2">35% Complete</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h5>Upcoming Content</h5>
                        <ul className="list-group mt-3">
                          <li className="list-group-item">Module 1: Introduction</li>
                          <li className="list-group-item">Module 2: Supervised Learning</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body">
                        <h5>Certification</h5>
                        <p className="mt-3">Complete the course to unlock your certificate</p>
                        <Button variant="outline-primary" disabled>Download Certificate</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="primary" className="mt-3">Continue Learning</Button>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <ul className="list-group">
                <li className="list-group-item">Completed Module 1: Introduction</li>
                <li className="list-group-item">Started Module 2: Supervised Learning</li>
                <li className="list-group-item">Achieved Quiz Score: 85%</li>
              </ul>
            </Card.Body>
          </Card>
        </div>

        {/* PDF Tools Section */}
        <div className="col-lg-4 col-md-12">
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>PDF Tools</span>
                <span className={`badge ${
                  serverStatus === 'healthy' ? 'bg-success' : 
                  serverStatus === 'unreachable' ? 'bg-danger' : 'bg-warning'
                }`}>
                  {serverStatus === 'healthy' ? 'Server Online' : 
                   serverStatus === 'unreachable' ? 'Server Offline' : 'Checking Server...'}
                </span>
              </Card.Title>

              {!pdfFile ? (
                <div className="text-center py-4 border rounded">
                  <Form.Group>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={() => fileInputRef.current.click()}
                      disabled={serverStatus !== 'healthy'}
                    >
                      Upload PDF
                    </Button>
                    <Form.Text className="d-block mt-2">
                      Supported format: PDF (max 10MB)
                    </Form.Text>
                  </Form.Group>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-truncate">
                      <i className="far fa-file-pdf me-2 text-danger"></i>
                      {pdfName}
                    </span>
                    <Button variant="outline-danger" size="sm" onClick={removePdf}>
                      Remove
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    className="w-100 mb-3"
                    onClick={generateSummary}
                    disabled={isSummarizing || serverStatus !== 'healthy'}
                  >
                    {isSummarizing ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Generating Summary...
                      </>
                    ) : 'Generate Summary'}
                  </Button>

                  {pdfError && (
                    <Alert variant="danger">
                      <strong>Error:</strong> {pdfError}
                    </Alert>
                  )}

                  {(summary || isSummarizing) && (
                    <div className="mt-3">
                      {isSummarizing && !summary ? (
                        <div className="text-center p-4">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-2">Processing with OctoAI...</p>
                        </div>
                      ) : (
                        <Form.Group>
                          <Form.Label>Document Summary</Form.Label>
                          <div className="summary-display p-3 mb-2 bg-light rounded">
                            {summary}
                            {summarizationMeta && (
                              <div className="text-muted small mt-2">
                                <div>Model: {summarizationMeta.model}</div>
                                <div>Processed: {summarizationMeta.chars} characters</div>
                              </div>
                            )}
                          </div>
                          <Form.Label>Edit Summary</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={6}
                            value={summaryInput}
                            onChange={(e) => setSummaryInput(e.target.value)}
                            placeholder="Edit the summary..."
                          />
                        </Form.Group>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;