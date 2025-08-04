import React, { useState } from 'react';
import CourseHeader from './CourseHeader';
import CourseContent from './CourseContent';
import Sidebar from './Sidebar';
import EnrollModal from './EnrollModal';

const CoursePage = () => {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [loginData, setLoginData] = useState(null);

  const handleLogin = () => {
    // For demo purposes, we'll use mock data
    // In a real app, you would have a login form or authentication
    const mockUser = {
      name: 'Demo User',
      email: 'demo@example.com',
      mobile: '9876543210',
      isVerified: true,
      paymentStatus: 'completed'
    };
    setLoginData(mockUser);
    
    // Redirect to dashboard immediately
    window.location.href = `/dashboard?name=${encodeURIComponent(mockUser.name)}`;
  };

  return (
    <div className="course-page">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <CourseHeader 
              onEnrollClick={() => setShowEnrollModal(true)}
              onLoginClick={handleLogin}
            />
            <CourseContent onEnrollClick={() => setShowEnrollModal(true)} />
          </div>
          <div className="col-lg-4 col-md-12">
            <Sidebar />
          </div>
        </div>
      </div>
      
      <EnrollModal 
        show={showEnrollModal} 
        handleClose={() => setShowEnrollModal(false)} 
      />
    </div>
  );
};

export default CoursePage;