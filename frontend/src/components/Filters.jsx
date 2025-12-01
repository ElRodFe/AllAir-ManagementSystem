import React from "react";
import "../styles/components/Filters.css";
import { normalize } from "../utils/util";

export default function Filters({ payment_status = [], work_status = [], selected, onChange }) {
  const set = (key, val) => onChange({ ...selected, [key]: val });

  return (
    <div className="filters">
      {/* Payment Status */}
      <label className="filter-item">
        <span className="label">Payment Status</span>
        <select
          value={selected.payment_status || ""}
          onChange={(e) => set("payment_status", e.target.value)}
        >
          <option value="">All</option>
          {payment_status.map((status) => (
            <option key={status} value={status}>
              {normalize(status, /_/g, " ")}
            </option>
          ))}
        </select>
      </label>

      {/* Work Status */}
      <label className="filter-item">
        <span className="label">Work Status</span>
        <select
          value={selected.work_status || ""}
          onChange={(e) => set("work_status", e.target.value)}
        >
          <option value="">All</option>
          {work_status.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      {/* Sort Order */}
      <label className="filter-sort">
        <span className="label">Sort Order</span>
        <button
          className="sort-toggle"
          onClick={() => set("order", selected.order === "asc" ? "desc" : "asc")}
        >
          {selected.order === "asc" ? "Asc" : "Desc"}
        </button>
      </label>
    </div>
  );
}
