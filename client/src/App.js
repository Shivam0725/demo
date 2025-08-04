import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CoursePage from './components/CoursePage';
import Dashboard from './components/Dashboard';
import EnrollModal from './components/EnrollModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <CoursePage onEnrollClick={() => setShowEnrollModal(true)} />
            } 
          />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        {/* Modal outside Routes to render on all pages */}
        <EnrollModal 
          show={showEnrollModal} 
          handleClose={() => setShowEnrollModal(false)} 
        />
      </Router>
    </div>
  );
}

export default App;