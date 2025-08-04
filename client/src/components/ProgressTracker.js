import React from 'react';

const ProgressTracker = ({ percentage }) => {
  return (
    <div className="progress-tracker mb-4">
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="d-flex justify-content-between">
        <span>Progress</span>
        <span>{percentage}% Complete</span>
      </div>
    </div>
  );
};

export default ProgressTracker;


