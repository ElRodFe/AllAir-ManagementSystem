import React, { useEffect } from 'react';
import '../styles/pages/ErrorPage.css';

export default function Error500() {
  useEffect(() => {
    document.title = 'AllAir | 500 Internal Server Error';
  }, []);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="error-page error-500">
      <header className="error-header">
        <div className="error-header-content">
          <img src="/assets/allair_logo.svg" alt="AllAir Logo" className="error-logo" />
        </div>
      </header>
      
      <div className="error-container-minimal">
        <div className="error-image-large">
          <img src="/assets/error-500.png" alt="Server Error" />
        </div>
        
        <div className="error-actions">
          <button className="btn-primary" onClick={handleGoHome}>
            Go to Homepage
          </button>
          <button className="btn-secondary" onClick={handleGoBack}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
