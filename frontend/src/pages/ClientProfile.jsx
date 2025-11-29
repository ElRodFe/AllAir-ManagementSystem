import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import sampleCustomers from "../data/sampleCustomers.json";
import sampleVehicles from "../data/sampleVehicles.json";
import Header from "../components/Header";
import "../styles/pages/ClientProfile.css";

export default function ClientProfile() {
  const { id } = useParams();
  const clientId = Number(id);

  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Find client
    const foundClient = sampleCustomers.find((c) => c.id === clientId);
    setClient(foundClient);

    // Filter vehicles owned by this client
    const ownedVehicles = sampleVehicles.filter(
      (v) => v.owner_id === clientId
    );
    setVehicles(ownedVehicles);
  }, [clientId]);

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
          <p><strong>Phone:</strong> {client.phone}</p>
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
                </tr>
              </thead>

              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>{v.vehicle_type}</td>
                    <td>{v.brand_model}</td>
                    <td>{v.kilometers}</td>
                    <td>{v.plate_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  );
}
