// src/components/Tabs.js
import React, { useState } from 'react';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="tabs-container">
      <ul className="nav nav-tabs">
        {tabs.map(tab => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-content p-3 border border-top-0 rounded-bottom">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <h3>About This Course</h3>
            <p>This course provides a broad introduction to machine learning...</p>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="curriculum-content">
            <h3>Course Curriculum</h3>
            <ul className="list-group">
              <li className="list-group-item">Module 1: Introduction to ML</li>
              <li className="list-group-item">Module 2: Supervised Learning</li>
              <li className="list-group-item">Module 3: Unsupervised Learning</li>
            </ul>
          </div>
        )}

        {activeTab === 'instructor' && (
          <div className="instructor-content">
            <h3>About the Instructor</h3>
            <div className="d-flex align-items-center">
              <img 
                src="https://via.placeholder.com/100" 
                alt="Instructor" 
                className="rounded-circle me-3"
              />
              <div>
                <h4>Dr. John Smith</h4>
                <p>Machine Learning Expert with 10+ years experience</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-content">
            <h3>Student Reviews</h3>
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <h5>Excellent Course</h5>
                  <span className="badge bg-warning text-dark">5 ★</span>
                </div>
                <p>This course helped me understand the fundamentals clearly.</p>
                <small className="text-muted">- Jane Doe</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;