import React from 'react';
import "../styles/components/Paginations.css";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 5
}) {

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let p = left; p <= right; p++) {
      pages.push(p);
    }
    return pages;
  };

  return (
    <div className="pagination">
      <div className="page-controls">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          &lt;&lt;
        </button>

        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          &lt;
        </button>

        {getPages().map(p => (
          <button
            key={p}
            className={p === currentPage ? "active" : ""}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          &gt;
        </button>

        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}
