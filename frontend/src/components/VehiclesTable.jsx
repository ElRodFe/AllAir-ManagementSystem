import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Table.css";

export default function VehiclesTable({ items, onView, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    navigate(`/vehicle/${id}`);
  };

  return (
    <div className="table-wrap">
      <table className="table" role="table" aria-label="Vehicles">
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th>Type</th>
            <th>Brand / Model</th>
            <th>Plate Number</th>
            <th>Kilometers</th>
            <th>Actions</th>
            <th></th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr className="no-results">
              <td colSpan="6">No vehicles found.</td>
            </tr>
          ) : (
            items.map((v) => (
              <tr
                key={v.id}
                className="row"
                onClick={() => handleRowClick(v.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="col-id">#{v.id}</td>
                <td>{v.vehicle_type}</td>
                <td>{v.brand_model}</td>
                <td>{v.plate_number}</td>
                <td>{v.kilometers || "—"}</td>

                {onView && (
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(v);
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
                        onEdit(v);
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
                        onDelete(v.id);
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
