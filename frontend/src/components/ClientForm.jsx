import React, { useState, useEffect } from "react";
import { createClient, updateClient } from "../services/clientService";

export default function ClientForm({ initialData, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    email: "",
  });

  const [error, setError] = useState("");

  // Load initial values for editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        phone_number: initialData.phone_number || "",
        email: initialData.email || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (initialData) {
        // EDIT
        await updateClient(initialData.id, form);
      } else {
        // CREATE
        await createClient(form);
      }

      onSuccess();
    } catch (err) {
      setError(err.message || "Error submitting form");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>

      {error && <div className="form-error">{error}</div>}

      <label className="form-label">Full Name</label>
      <input
        type="text"
        name="name"
        className="form-input"
        value={form.name}
        onChange={handleChange}
        required
      />

      <label className="form-label">Phone Number</label>
      <input
        type="text"
        name="phone_number"
        className="form-input"
        value={form.phone_number}
        onChange={handleChange}
        required
      />

      <label className="form-label">Email</label>
      <input
        type="email"
        name="email"
        className="form-input"
        value={form.email}
        onChange={handleChange}
        placeholder="Optional"
      />

      <div className="form-actions">
        <button type="submit" className="btn primary">
          {initialData ? "Save Changes" : "Create Client"}
        </button>

        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
