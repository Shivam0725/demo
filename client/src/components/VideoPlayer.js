import React from 'react';

const VideoPlayer = () => {
  return (
    <div className="video-container">
      <div className="embed-responsive embed-responsive-16by9">
        <iframe 
          className="embed-responsive-item" 
          src="https://www.youtube.com/embed/your-video-id" 
          allowFullScreen
          title="Course Video"
        ></iframe>
      </div>
      <div className="video-controls d-flex justify-content-between p-2">
        <button className="btn btn-sm btn-outline-secondary">Previous</button>
        <div>
          <span className="mr-2">Quality: 720p</span>
          <button className="btn btn-sm btn-outline-secondary">Settings</button>
        </div>
        <button className="btn btn-sm btn-outline-secondary">Next</button>
      </div>
    </div>
  );
};

export default VideoPlayer;