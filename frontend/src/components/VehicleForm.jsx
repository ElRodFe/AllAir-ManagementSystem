import { useState } from "react";
import { createVehicle, updateVehicle } from "../services/vehicleService";
import { useToast } from "../utils/useToast";

export default function VehicleForm({ clientId, vehicle, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState({
    vehicle_type: vehicle?.vehicle_type || "",
    brand_model: vehicle?.brand_model || "",
    kilometers: vehicle?.kilometers || "",
    plate_number: vehicle?.plate_number || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (vehicle) {
        await updateVehicle(vehicle.id, form);
        toast.success("Vehicle updated successfully!");
      } else {
        await createVehicle({
          ...form,
          owner_id: Number(clientId),
        });
        toast.success("Vehicle created successfully!");
      }

      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error saving vehicle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vehicle-form">

      <div className="input-group">
        <label>Vehicle Type</label>
        <input
          name="vehicle_type"
          value={form.vehicle_type}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label>Brand / Model</label>
        <input
          name="brand_model"
          value={form.brand_model}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label>Kilometers</label>
        <input
          type="number"
          name="kilometers"
          value={form.kilometers}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label>Plate Number</label>
        <input
          name="plate_number"
          value={form.plate_number}
          onChange={handleChange}
          required
        />
      </div>

      <button className="btn primary" disabled={loading}>
        {loading
          ? "Saving..."
          : vehicle
          ? "Save Changes"
          : "Create Vehicle"}
      </button>
    </form>
  );
}
