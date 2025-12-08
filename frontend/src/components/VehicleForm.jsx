import React, { useState } from "react";

export default function VehicleForm({ vehicle = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    vehicle_type: vehicle?.vehicle_type || "",
    brand_model: vehicle?.brand_model || "",
    kilometers: vehicle?.kilometers || "",
    plate_number: vehicle?.plate_number || "",
  }));

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
      <label htmlFor="vehicle-type">Vehicle Type</label>
      <input
        id="vehicle-type"
        name="vehicle_type"
        type="text"
        value={form.vehicle_type}
        onChange={handleChange}
        required
      />

      <label htmlFor="brand-model">Brand / Model</label>
      <input
        id="brand-model"
        name="brand_model"
        type="text"
        value={form.brand_model}
        onChange={handleChange}
        required
      />

      <label htmlFor="kilometers">Kilometers</label>
      <input
        id="kilometers"
        type="number"
        name="kilometers"
        value={form.kilometers}
        onChange={handleChange}
        required
      />

      <label htmlFor="plate-number">Plate Number</label>
      <input
        id="plate-number"
        name="plate_number"
        type="text"
        value={form.plate_number}
        onChange={handleChange}
        required
      />

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
