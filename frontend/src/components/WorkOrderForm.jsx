// src/components/WorkOrderForm.jsx
import React, { useEffect, useMemo, useState } from 'react';

export default function WorkOrderForm({ clients = [], vehicles = [], initialData = null, onSubmit, onCancel }) {
  // initial values
  const init = {
    entry_date: '',
    egress_date: '',
    client_id: '',
    vehicle_id: '',
    work_status: '',
    payment_status: '',
    refrigerant_gas_retrieved: '',
    refrigerant_gas_injected: '',
    oil_retrieved: '',
    oil_injected: '',
    detector: '',
    spare_parts: '',
    details: '',
    workers: '',
    hours: '',
    ...initialData
  };

  const [form, setForm] = useState(init);

  useEffect(() => {
    setForm(prev => ({ ...prev, ...init }));
  }, [initialData]);

  // Filter vehicles by selected client
  const filteredVehicles = useMemo(() => {
    if (!form.client_id) return [];
    return vehicles.filter(v => String(v.owner_id) === String(form.client_id));
  }, [vehicles, form.client_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    // Build final payload mapping types
    const payload = {
      entry_date: form.entry_date,
      egress_date: form.egress_date || null,
      client_id: Number(form.client_id),
      vehicle_id: Number(form.vehicle_id),
      work_status: form.work_status,
      payment_status: form.payment_status,
      refrigerant_gas_retrieved: form.refrigerant_gas_retrieved ? Number(form.refrigerant_gas_retrieved) : null,
      refrigerant_gas_injected: form.refrigerant_gas_injected ? Number(form.refrigerant_gas_injected) : null,
      oil_retrieved: form.oil_retrieved ? Number(form.oil_retrieved) : null,
      oil_injected: form.oil_injected ? Number(form.oil_injected) : null,
      detector: form.detector === "" ? null : form.detector === "true",
      spare_parts: form.spare_parts || null,
      details: form.details || null,
      workers: form.workers,
      hours: form.hours ? Number(form.hours) : null,
    };

    onSubmit(payload);
  };

  return (
    <form className="modal-form" onSubmit={submit}>
      <label>
        Entry Date:
        <input type="date" name="entry_date" value={form.entry_date || ''} onChange={handleChange} required />
      </label>

      <label>
        Egress Date:
        <input type="date" name="egress_date" value={form.egress_date || ''} onChange={handleChange} />
      </label>

      <label>
        Client:
        <select name="client_id" value={form.client_id || ''} onChange={handleChange} required>
          <option value="">Select client...</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Vehicle:
        <select
          name="vehicle_id"
          value={form.vehicle_id || ''}
          onChange={handleChange}
          required
          disabled={!form.client_id}
        >
          <option value="">{form.client_id ? "Select vehicle..." : "Select a client first"}</option>
          {filteredVehicles.map(v => (
            <option key={v.id} value={v.id}>
              {v.plate_number} {/* or other label */}
            </option>
          ))}
        </select>
      </label>

      <label>
        Work Status:
        <select name="work_status" value={form.work_status || ''} onChange={handleChange} required>
          <option value="">Select...</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </label>

      <label>
        Payment Status:
        <select name="payment_status" value={form.payment_status || ''} onChange={handleChange} required>
          <option value="">Select...</option>
          <option value="NOT_PAID">Not Paid</option>
          <option value="PAID">Paid</option>
          <option value="BILL_SENT">Bill Sent</option>
          <option value="NOT_REQUESTED">Not Requested</option>
        </select>
      </label>

      <label>
        Refrigerant Gas Retrieved (g):
        <input type="number" name="refrigerant_gas_retrieved" value={form.refrigerant_gas_retrieved || ''} onChange={handleChange} />
      </label>

      <label>
        Refrigerant Gas Injected (g):
        <input type="number" name="refrigerant_gas_injected" value={form.refrigerant_gas_injected || ''} onChange={handleChange} />
      </label>

      <label>
        Oil Retrieved (ml):
        <input type="number" name="oil_retrieved" value={form.oil_retrieved || ''} onChange={handleChange} />
      </label>

      <label>
        Oil Injected (ml):
        <input type="number" name="oil_injected" value={form.oil_injected || ''} onChange={handleChange} />
      </label>

      <label>
        Detector Used:
        <select name="detector" value={
            form.detector === null ? '' : String(form.detector)
          } onChange={handleChange}>
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>

      <label>
        Spare Parts:
        <textarea name="spare_parts" value={form.spare_parts || ''} onChange={handleChange} />
      </label>

      <label>
        Details:
        <textarea name="details" value={form.details || ''} onChange={handleChange} />
      </label>

      <label>
        Workers (required):
        <input type="text" name="workers" value={form.workers || ''} onChange={handleChange} required />
      </label>

      <label>
        Hours Worked:
        <input type="number" name="hours" value={form.hours || ''} onChange={handleChange} />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}
