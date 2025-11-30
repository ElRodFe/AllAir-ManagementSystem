import React, { useEffect } from 'react';
import '../styles/pages/ErrorPage.css';

export default function Error401() {
  useEffect(() => {
    document.title = 'AllAir | 401 Unauthentication Error';
  }, []);

  const handleLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="error-page error-401">
      <header className="error-header">
        <div className="error-header-content">
          <img src="/assets/allair_logo.svg" alt="AllAir Logo" className="error-logo" />
        </div>
      </header>
      
      <div className="error-container-minimal">
        <div className="error-image-large">
          <img src="/assets/error-401.png" alt="Unauthorized Access" />
        </div>
        
        <div className="error-actions">
          <button className="btn-primary" onClick={handleLogin}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
