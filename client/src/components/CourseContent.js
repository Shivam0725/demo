
import React from 'react';
import Tabs from './Tabs';

const CourseContent = ({ onEnrollClick }) => {
  return (
    <div>
      <div className="video-container mb-4">
        <div className="ratio ratio-16x9">
          <iframe 
            src="https://www.youtube.com/embed/your-video-id" 
            title="Course Video" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
      
      <div className="video-controls d-flex justify-content-between mb-4">
        <button className="btn btn-outline-secondary">Previous</button>
        <div>
          <span className="me-2">Quality: 720p</span>
          <button className="btn btn-outline-secondary">Settings</button>
        </div>
        <button className="btn btn-outline-secondary">Next</button>
      </div>
      
      <button 
        className="btn btn-primary mb-4" 
        onClick={onEnrollClick}
      >
        Enroll Now
      </button>
      
      <Tabs />
    </div>
  );
};

export default CourseContent;
