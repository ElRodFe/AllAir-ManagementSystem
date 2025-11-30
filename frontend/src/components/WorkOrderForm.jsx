import React, { useState, useEffect } from "react";
import { createWorkOrder, updateWorkOrder } from "../api";

export default function WorkOrderForm({ mode, initialData, onClose, onSuccess }) {
  const [form, setForm] = useState({
    client_id: "",
    vehicle_id: "",
    entry_date: "",
    egress_date: "",
    work_status: "",
    payment_status: "",
    workers: "",
    hours: "",
    details: "",
    spare_parts: "",
    refrigerant_gas_retrieved: "",
    refrigerant_gas_injected: "",
    oil_retrieved: "",
    oil_injected: "",
    detector: false
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm(initialData);
    }
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "add") {
        await createWorkOrder(form);
      } else {
        await updateWorkOrder(initialData.id, form);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save work order");
    }
  };

  return (
    <form className="wo-form" onSubmit={handleSubmit}>
      <div className="form-grid">

        <label>
          Client ID
          <input name="client_id" value={form.client_id} onChange={handleChange} required />
        </label>

        <label>
          Vehicle ID
          <input name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required />
        </label>

        <label>
          Entry Date
          <input type="date" name="entry_date" value={form.entry_date} onChange={handleChange} />
        </label>

        <label>
          Egress Date
          <input type="date" name="egress_date" value={form.egress_date} onChange={handleChange} />
        </label>

        <label>
          Work Status
          <select name="work_status" value={form.work_status} onChange={handleChange}>
            <option value="">Select…</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label>
          Payment Status
          <select name="payment_status" value={form.payment_status} onChange={handleChange}>
            <option value="">Select…</option>
            <option value="not_paid">Not Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
          </select>
        </label>

        <label>
          Workers
          <input name="workers" value={form.workers} onChange={handleChange} />
        </label>

        <label>
          Hours
          <input name="hours" type="number" value={form.hours} onChange={handleChange} />
        </label>

        <label className="full-width">
          Details
          <textarea name="details" value={form.details} onChange={handleChange} />
        </label>

        <label className="full-width">
          Spare Parts
          <textarea name="spare_parts" value={form.spare_parts} onChange={handleChange} />
        </label>

        <label>
          Refrigerant Gas Retrieved
          <input name="refrigerant_gas_retrieved" type="number" value={form.refrigerant_gas_retrieved} onChange={handleChange} />
        </label>

        <label>
          Refrigerant Gas Injected
          <input name="refrigerant_gas_injected" type="number" value={form.refrigerant_gas_injected} onChange={handleChange} />
        </label>

        <label>
          Oil Retrieved
          <input name="oil_retrieved" type="number" value={form.oil_retrieved} onChange={handleChange} />
        </label>

        <label>
          Oil Injected
          <input name="oil_injected" type="number" value={form.oil_injected} onChange={handleChange} />
        </label>

        <label>
          Detector Used
          <input type="checkbox" name="detector" checked={form.detector} onChange={handleChange} />
        </label>
      </div>

      <button className="save-btn" type="submit">
        {mode === "add" ? "Create Work Order" : "Save Changes"}
      </button>
    </form>
  );
}
