import React from "react";
import "../styles/components/SearchBar.css";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search Order...",
  ariaLabel = "Search orders",
}) {
  return (
    <div className="searchbar between">
      <input
        className="searchbar-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      <img className="search-icon" aria-hidden="true" src="/assets/search.svg" alt="Search Icon" />
    </div>
  );
}
