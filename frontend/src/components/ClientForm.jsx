import React, { useState, useEffect } from "react";

export default function ClientForm({ initialData = null, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: initialData?.name || "",
    phone_number: initialData?.phone_number || "",
    email: initialData?.email || "",
  }));

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        phone_number: initialData.phone_number || "",
        email: initialData.email || "",
      });
    } else {
      setForm({ name: "", phone_number: "", email: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      phone_number: form.phone_number.trim(),
      email: form.email || null,
    };

    onSubmit(payload);
  };

  return (
    <form className="modal-form" onSubmit={submit}>
      <label htmlFor="client-name">Full Name</label>
      <input
        id="client-name"
        name="name"
        type="text"
        value={form.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="client-phone">Phone Number</label>
      <input
        id="client-phone"
        name="phone_number"
        type="text"
        value={form.phone_number}
        onChange={handleChange}
        required
      />

      <label htmlFor="client-email">Email</label>
      <input
        id="client-email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Optional"
      />

      <div className="modal-footer">
        <button type="button" className="btn warning" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit" className="btn create">
          {initialData ? "Save Changes" : "Create Client"}
        </button>
      </div>
    </form>
  );
}
