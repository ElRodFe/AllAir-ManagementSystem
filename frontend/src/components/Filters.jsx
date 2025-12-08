import React, { useCallback } from "react";
import "../styles/components/Filters.css";
import { normalize } from "../utils/util";

export default function Filters({ payment_status = [], work_status = [], selected, onChange }) {
  const set = useCallback(
    (key, val) => onChange({ ...selected, [key]: val }),
    [onChange, selected]
  );

  return (
    <div className="filters">
      {/* PAYMENT STATUS */}
      <div className="filter-item">
        <label className="filter-label" htmlFor="filter-payment-status">
          Payment Status
        </label>

        <select
          id="filter-payment-status"
          name="payment_status"
          className="filter-select"
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
      </div>

      {/* WORK STATUS */}
      <div className="filter-item">
        <label className="filter-label" htmlFor="filter-work-status">
          Work Status
        </label>

        <select
          id="filter-work-status"
          name="work_status"
          className="filter-select"
          value={selected.work_status || ""}
          onChange={(e) => set("work_status", e.target.value)}
        >
          <option value="">All</option>
          {work_status.map((status) => (
            <option key={status} value={status}>
              {normalize(status, /_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* SORT ORDER */}
      <div className="filter-sort">
        <label className="filter-label" htmlFor="filter-sort">
          Sort Order
        </label>

        <button
          id="filter-sort"
          type="button"
          className={`sort-toggle ${selected.order === "desc" ? "active" : ""}`}
          onClick={() => set("order", selected.order === "asc" ? "desc" : "asc")}
        >
          {selected.order === "asc" ? "Asc" : "Desc"}
        </button>
      </div>
    </div>
  );
}
