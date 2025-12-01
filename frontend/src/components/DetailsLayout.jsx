import React from "react";
import "../styles/pages/Details.css";

export default function DetailsLayout({ title, children }) {
  return (
    <div className="details-page">
      <h2 className="details-title">{title}</h2>

      <div className="details-app-shell">{children}</div>
    </div>
  );
}
