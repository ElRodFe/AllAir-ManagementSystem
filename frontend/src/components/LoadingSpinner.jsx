import React from "react";
import "../styles/components/LoadingSpinner.css";

export default function LoadingSpinner({ message = "Loading...", fullPage = false }) {
  const content = (
    <div className="loading-spinner-container">
      <div className="spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-spinner-fullpage">{content}</div>;
  }

  return content;
}
