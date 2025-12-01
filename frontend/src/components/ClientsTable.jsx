import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Table.css";

export default function ClientsTable({ items, onView, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    navigate(`/clients/${id}`);
  };

  return (
    <div className="table-wrap">
      <table className="table" role="table" aria-label="Clients">
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Email</th>
            {onView && <th>Details</th>}
            {onEdit && <th>Edit</th>}
            {onDelete && <th>Delete</th>}
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr className="no-results">
              <td colSpan="7">No clients found</td>
            </tr>
          ) : (
            items.map((c) => (
              <tr
                key={c.id}
                className="row"
                onClick={() => handleRowClick(c.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="col-id">#{c.id}</td>
                <td>{c.name}</td>
                <td>{c.phone_number || "—"}</td>
                <td>{c.email || "—"}</td>

                {onView && (
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(c);
                      }}
                    >
                      Details
                    </button>
                  </td>
                )}

                {onEdit && (
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(c);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                )}

                {onDelete && (
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
