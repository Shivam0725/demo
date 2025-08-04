import React from 'react';

const CourseHeader = ({ onEnrollClick, onLoginClick }) => {
  return (
    <div className="course-header">
      <h1>Introduction to Machine Learning</h1>
      <div className="d-flex align-items-center mb-4">
        <span className="badge bg-warning text-dark me-2">4.5 ★</span>
        <span className="me-3">(1,234 reviews)</span>
        <button className="btn btn-primary me-2" onClick={onEnrollClick}>
          Enroll Now
        </button>
        <button className="btn btn-outline-primary" onClick={onLoginClick}>
          Login
        </button>
      </div>
    </div>
  );
};

export default CourseHeader;