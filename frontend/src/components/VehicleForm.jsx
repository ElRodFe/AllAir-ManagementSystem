import React, { useState, useEffect } from "react";

export default function VehicleForm({ vehicle = null, onSubmit, onCancel }) {
  const init = {
    vehicle_type: vehicle?.vehicle_type || "",
    brand_model: vehicle?.brand_model || "",
    kilometers: vehicle?.kilometers || "",
    plate_number: vehicle?.plate_number || "",
  };

  const [form, setForm] = useState(init);

  useEffect(() => {
    setForm({ ...init });
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      vehicle_type: form.vehicle_type.trim(),
      brand_model: form.brand_model.trim(),
      kilometers: Number(form.kilometers),
      plate_number: form.plate_number.trim(),
    };

    onSubmit(payload);
  };

  return (
    <form className="modal-form" onSubmit={submit}>
      <label>Vehicle Type</label>
      <input name="vehicle_type" value={form.vehicle_type} onChange={handleChange} required />

      <label>Brand / Model</label>
      <input name="brand_model" value={form.brand_model} onChange={handleChange} required />

      <label>Kilometers</label>
      <input
        type="number"
        name="kilometers"
        value={form.kilometers}
        onChange={handleChange}
        required
      />

      <label>Plate Number</label>
      <input name="plate_number" value={form.plate_number} onChange={handleChange} required />

      <div className="modal-footer">
        <button type="button" className="btn warning" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="btn create">
          {vehicle ? "Save Changes" : "Create Vehicle"}
        </button>
      </div>
    </form>
  );
}
