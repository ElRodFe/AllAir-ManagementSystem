import React, { useState, useMemo } from "react";

export default function WorkOrderForm({
  clients = [],
  vehicles = [],
  initialData = null,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(() => ({
    entry_date: initialData?.entry_date || "",
    egress_date: initialData?.egress_date || "",
    client_id: initialData?.client_id || "",
    vehicle_id: initialData?.vehicle_id || "",
    work_status: initialData?.work_status || "",
    payment_status: initialData?.payment_status || "",
    refrigerant_gas_retrieved: initialData?.refrigerant_gas_retrieved || "",
    refrigerant_gas_injected: initialData?.refrigerant_gas_injected || "",
    oil_retrieved: initialData?.oil_retrieved || "",
    oil_injected: initialData?.oil_injected || "",
    detector: initialData?.detector ?? "",
    spare_parts: initialData?.spare_parts || "",
    details: initialData?.details || "",
    workers: initialData?.workers || "",
    hours: initialData?.hours || "",
  }));

  // Filter vehicles by selected client
  const filteredVehicles = useMemo(() => {
    if (!form.client_id) return [];
    return vehicles.filter((v) => String(v.owner_id) === String(form.client_id));
  }, [vehicles, form.client_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      entry_date: form.entry_date,
      egress_date: form.egress_date || null,
      client_id: Number(form.client_id),
      vehicle_id: Number(form.vehicle_id),
      work_status: form.work_status,
      payment_status: form.payment_status,
      refrigerant_gas_retrieved: form.refrigerant_gas_retrieved
        ? Number(form.refrigerant_gas_retrieved)
        : null,
      refrigerant_gas_injected: form.refrigerant_gas_injected
        ? Number(form.refrigerant_gas_injected)
        : null,
      oil_retrieved: form.oil_retrieved ? Number(form.oil_retrieved) : null,
      oil_injected: form.oil_injected ? Number(form.oil_injected) : null,
      detector: form.detector === "" ? null : form.detector === "true",
      spare_parts: form.spare_parts || null,
      details: form.details || null,
      workers: form.workers.trim(),
      hours: form.hours ? Number(form.hours) : null,
    };

    onSubmit(payload);
  };

  return (
    <form className="modal-form" onSubmit={submit}>
      <label htmlFor="entry-date">Entry Date</label>
      <input
        id="entry-date"
        type="date"
        name="entry_date"
        value={form.entry_date}
        onChange={handleChange}
        required
      />

      <label htmlFor="egress-date">Egress Date</label>
      <input
        id="egress-date"
        type="date"
        name="egress_date"
        value={form.egress_date}
        onChange={handleChange}
      />

      <label htmlFor="client">Client</label>
      <select id="client" name="client_id" value={form.client_id} onChange={handleChange} required>
        <option value="">Select client...</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label htmlFor="vehicle">Vehicle</label>
      <select
        id="vehicle"
        name="vehicle_id"
        value={form.vehicle_id}
        onChange={handleChange}
        required
        disabled={!form.client_id}
      >
        <option value="">{form.client_id ? "Select vehicle..." : "Select a client first"}</option>
        {filteredVehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.plate_number}
          </option>
        ))}
      </select>

      <label htmlFor="work-status">Work Status</label>
      <select
        id="work-status"
        name="work_status"
        value={form.work_status}
        onChange={handleChange}
        required
      >
        <option value="">Select...</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <label htmlFor="payment-status">Payment Status</label>
      <select
        id="payment-status"
        name="payment_status"
        value={form.payment_status}
        onChange={handleChange}
        required
      >
        <option value="">Select...</option>
        <option value="NOT_PAID">Not Paid</option>
        <option value="PAID">Paid</option>
        <option value="BILL_SENT">Bill Sent</option>
        <option value="NOT_REQUESTED">Not Requested</option>
      </select>

      <label htmlFor="gas-retrieved">Refrigerant Gas Retrieved (g)</label>
      <input
        id="gas-retrieved"
        type="number"
        name="refrigerant_gas_retrieved"
        value={form.refrigerant_gas_retrieved}
        onChange={handleChange}
      />

      <label htmlFor="gas-injected">Refrigerant Gas Injected (g)</label>
      <input
        id="gas-injected"
        type="number"
        name="refrigerant_gas_injected"
        value={form.refrigerant_gas_injected}
        onChange={handleChange}
      />

      <label htmlFor="oil-retrieved">Oil Retrieved (ml)</label>
      <input
        id="oil-retrieved"
        type="number"
        name="oil_retrieved"
        value={form.oil_retrieved}
        onChange={handleChange}
      />

      <label htmlFor="oil-injected">Oil Injected (ml)</label>
      <input
        id="oil-injected"
        type="number"
        name="oil_injected"
        value={form.oil_injected}
        onChange={handleChange}
      />

      <label htmlFor="detector">Leak Detector Used</label>
      <select
        id="detector"
        name="detector"
        value={form.detector === null ? "" : String(form.detector)}
        onChange={handleChange}
      >
        <option value="">Select...</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <label htmlFor="spare-parts">Spare Parts</label>
      <textarea
        id="spare-parts"
        name="spare_parts"
        value={form.spare_parts}
        onChange={handleChange}
      />

      <label htmlFor="details">Details</label>
      <textarea id="details" name="details" value={form.details} onChange={handleChange} />

      <label htmlFor="workers">Workers (required)</label>
      <input
        id="workers"
        type="text"
        name="workers"
        value={form.workers}
        onChange={handleChange}
        required
      />

      <label htmlFor="hours">Hours Worked</label>
      <input id="hours" type="number" name="hours" value={form.hours} onChange={handleChange} />

      <div className="modal-footer">
        <button type="button" className="btn warning" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="btn create">
          {initialData ? "Save Changes" : "Create Work Order"}
        </button>
      </div>
    </form>
  );
}
