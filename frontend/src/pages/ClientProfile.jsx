import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import "../styles/pages/ClientProfile.css";
import { getClientById, getClientVehicles, addVehicle, deleteVehicle } from "../utils/api";
import Modal from "../components/Modal";

export default function ClientProfile() {
  const { id } = useParams();
  const clientId = Number(id);

  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_type: "",
    brand_model: "",
    kilometers: 0,
    plate_number: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const c = await getClientById(clientId);
        setClient(c);

        const v = await getClientVehicles(clientId);
        setVehicles(v);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, [clientId]);

  const openAddVehicleModal = () => setShowAddVehicleModal(true);
  const closeAddVehicleModal = () => setShowAddVehicleModal(false);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const form = e.target;
      const vehicleData = {
        vehicle_type: form.vehicle_type.value,
        brand_model: form.brand_model.value,
        kilometers: Number(form.kilometers.value),
        plate_number: form.plate_number.value,
        owner_id: clientId
      };
      const added = await addVehicle(clientId, vehicleData);
      setVehicles(prev => [...prev, added]);
      closeAddVehicleModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add vehicle: " + err.message);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await deleteVehicle(clientId, vehicleId);

      setVehicles((prev) => prev.filter(v => v.id !== vehicleId));

    } catch (err) {
      console.error(err);
      alert("Failed to delete vehicle: " + err.message);
    }
  };

  if (!client) return <p>Loading...</p>;

  return (
    <>
      <Header 
        icon_url="assets/user.svg" 
        title={`Client: ${client.name}`} 
        username="John Doe" 
      />

      <div className="client-profile-page">

        {/* Client Info */}
        <div className="card client-info-card">
          <h2 className="font-title margin-bottom-md">Client Information</h2>

          <p><strong>Name:</strong> {client.name}</p>
          <p><strong>Phone:</strong> {client.phone_number}</p>
          <p><strong>Email:</strong> {client.email || "Not provided"}</p>
        </div>

        {/* Vehicles */}
        <div className="card vehicles-card">
          <h2 className="font-title margin-bottom-md">Vehicles</h2>

          {vehicles.length === 0 ? (
            <p>No vehicles registered.</p>
          ) : (
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Brand/Model</th>
                  <th>Kilometers</th>
                  <th>Plate</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>{v.vehicle_type}</td>
                    <td>{v.brand_model}</td>
                    <td>{v.kilometers}</td>
                    <td>{v.plate_number}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteVehicle(v.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <Modal open={showAddVehicleModal} onClose={closeAddVehicleModal} title="Add Vehicle">
            <form className="modal-form" onSubmit={handleAddVehicle}>
              <label>
                Type:
                <input name="vehicle_type" required />
              </label>
              <label>
                Brand/Model:
                <input name="brand_model" required />
              </label>
              <label>
                Kilometers:
                <input type="number" name="kilometers" required />
              </label>
              <label>
                Plate:
                <input name="plate_number" required />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={closeAddVehicleModal}>Cancel</button>
                <button type="submit">Add Vehicle</button>
              </div>
            </form>
          </Modal>
            <button onClick={openAddVehicleModal}>+ Add Vehicle</button>
        </div>
      </div>
    </>
  );
}
