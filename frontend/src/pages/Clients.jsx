import { useEffect, useState } from "react";
import Header from "../components/Header";
import "../styles/pages/Clients.css";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { getClients, createClient } from "../utils/api";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load clients: " + err.message);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Create client
  const openAddClientModal = () => setShowAddClientModal(true);
  const closeAddClientModal = () => setShowAddClientModal(false);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      name: form.name.value,
      phone_number: form.phone.value,
      email: form.email.value || null,
    };

    try {
      await createClient(data);
      await loadData();
      closeAddClientModal();
      alert("Client added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add client: " + err.message);
    }
  };

  return (
    <>
      <Modal open={showAddClientModal} onClose={closeAddClientModal} title="Add Client">
        <form className="modal-form" onSubmit={handleCreateClient}>
          <label>
            Name:
            <input type="text" name="name" required />
          </label>
          <label>
            Phone:
            <input type="text" name="phone" required />
          </label>
          <label>
            Email (optional):
            <input type="email" name="email" />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={closeAddClientModal}>Cancel</button>
             <button type="submit">Create</button>
          </div>
        </form>
      </Modal>
      <Header icon_url="assets/user.svg" title="Clients" username="John Doe" />

      <div className="clients-page">

        <div className="between margin-bottom-md">
          <h2 className="font-title">Clients List</h2>

          <button className="add-client-btn" onClick={openAddClientModal}>
            + Add Client
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
