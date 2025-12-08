import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Paginations";
import Modal from "../components/Modal";
import ClientsTable from "../components/ClientsTable";
import ClientForm from "../components/ClientForm";
import LoadingSpinner from "../components/LoadingSpinner";
import useDebounce from "../utils/useDebounce";
import { useNotify } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

import { getClients, createClient, updateClient, deleteClient } from "../services/clientService";

export default function ClientsPage() {
  const navigate = useNavigate();
  const { pushNotification } = useNotify();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load clients
  const loadClients = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getClients();
      setClients(data || []);
    } catch (err) {
      setError(err.message || "Failed to load clients");
      pushNotification("Error loading clients.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // CREATE
  const handleCreate = async (payload) => {
    try {
      await createClient(payload);
      await loadClients();
      setShowModal(false);
      setEditingClient(null);

      pushNotification("Client created successfully!", "success");
    } catch (err) {
      /* axios interceptor handles server error */
    }
  };

  // UPDATE
  const handleUpdate = async (payload) => {
    try {
      await updateClient(editingClient.id, payload);
      await loadClients();
      setShowModal(false);
      setEditingClient(null);

      pushNotification("Client updated successfully!", "success");
    } catch (err) {}
  };

  // DELETE
  const handleDeleteClient = async (id) => {
    if (!confirm("Delete this client?")) {
      pushNotification("Delete canceled.", "info");
      return;
    }

    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));

      pushNotification("Client deleted!", "success");
    } catch (err) {}
  };

  // FILTERING + SEARCH
  const filtered = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    if (!s) return clients;

    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.phone_number || "").toLowerCase().includes(s) ||
        (c.email || "").toLowerCase().includes(s)
    );
  }, [clients, debouncedSearch]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  if (loading) {
    return <LoadingSpinner message="Loading clients..." fullPage />;
  }

  return (
    <>
      {/* CREATE / EDIT MODAL */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
          pushNotification("Action canceled.", "info");
        }}
        title={editingClient ? "Edit Client" : "Create New Client"}
      >
        <ClientForm
          initialData={editingClient}
          onSubmit={(payload) => (editingClient ? handleUpdate(payload) : handleCreate(payload))}
          onCancel={() => {
            setShowModal(false);
            setEditingClient(null);
            pushNotification("Action canceled.", "info");
          }}
        />
      </Modal>

      {/* HEADER */}
      <Header icon_url="/assets/user.svg" title="Clients" />

      <div className="dashboard">
        <div className="app-shell">
          {/* PAGE HEADER */}
          <div className="page-header margin-bottom-md between">
            <h2 className="font-subtitle">Client List</h2>

            <button className="btn add-btn" onClick={() => setShowModal(true)}>
              + New Client
            </button>
          </div>

          {/* SEARCH */}
          <div className="controls between">
            <SearchBar value={search} onChange={setSearch} placeholder="Search Client..." />
          </div>

          {/* TABLE */}
          <ClientsTable
            items={pageItems}
            onView={(id) => navigate(`/clients/${id}`)}
            onEdit={(client) => {
              setEditingClient(client);
              setShowModal(true);
            }}
            onDelete={handleDeleteClient}
          />

          {/* PAGINATION */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </div>
    </>
  );
}
