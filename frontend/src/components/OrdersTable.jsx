import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/OrdersTable.css";
import { normalize } from "../utils/util";

export default function OrdersTable({ items, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleRowClick = (orderId) => {
    navigate(`/work-order/${orderId}`);
  };

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
            <th>Actions</th>
            <th></th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr className="no-results">
              <td colSpan="6">No results</td>
            </tr>
          ) : (
            items.map((it) => (
              <tr 
                key={it.id} 
                className="orders-row" 
                onClick={() => handleRowClick(it.id)}
                style={{ cursor: 'pointer' }}
              >
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
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/work-order/${it.id}`);
                    }}
                  >
                    Details
                  </button>
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(it);
                    }}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(it.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
