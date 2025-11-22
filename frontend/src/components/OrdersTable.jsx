import React from "react";
import "../styles/components/OrdersTable.css";
import { normalize } from "../utils/util";

export default function OrdersTable({ items }) {

  return (
    <div className="table-wrap">
      <table className="orders-table" role="table" aria-label="Work orders">
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Work Status</th>
            <th>Payment Status</th>
            <th>Entry Date</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr className="no-results">
              <td colSpan="6">No results</td>
            </tr>
          ) : (
            items.map((it) => (
              <tr key={it.id} className="orders-row">
                <td className="order-id col-id">#{it.id}</td>

                <td>{it.customer_name || "—"}</td>

                <td>{it.customer_phone || "—"}</td>

                <td>
                  <span className={`badge ws-${normalize(it.work_status)}`}>
                    {normalize(it.work_status, /_/g, " ")}
                  </span>
                </td>

                <td>
                  <span className={`badge ps-${normalize(it.payment_status)}`}>
                    {normalize(it.payment_status, /_/g, " ")}
                  </span>
                </td>

                <td>
                  {it.entry_date
                    ? new Date(it.entry_date).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
