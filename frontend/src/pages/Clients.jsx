import { useEffect, useState } from "react";
import Header from "../components/Header";
import "../styles/pages/Clients.css";
import { Link } from "react-router-dom";

//Temporal Mock data
import sampleClients from "../data/sampleCustomers.json";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Using mock data for now
    setClients(sampleClients);
  }, []);

  return (
    <>
      <Header icon_url="assets/user.svg" title="Clients" username="John Doe" />

      <div className="clients-page">

        <div className="between margin-bottom-md">
          <h2 className="font-title">Clients List</h2>

          <button className="btn btn-primary">
            + Create New Client
          </button>
        </div>

        <div className="card clients-table-card">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.phone}</td>
                  <td>{client.email}</td>
                  <td>
                    <Link to={`/clients/${client.id}`}>
                      <button className="btn btn-secondary view-btn">View More</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
