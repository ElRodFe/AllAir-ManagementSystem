import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Paginations";
import Modal from "../components/Modal";
import ClientsTable from "../components/ClientsTable";
import ClientForm from "../components/ClientForm";
import LoadingSpinner from "../components/LoadingSpinner";
import useDebounce from "../utils/useDebounce";
import { useToast } from "../utils/useToast";
import { useNavigate } from "react-router-dom";

import { getClients, deleteClient } from "../services/clientService";

export default function ClientsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getClients();
      setClients(data || []);
    } catch (err) {
      console.error("Error loading clients:", err);
      setError(err.message || "Could not load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = (id) => {
    navigate(`/clients/${id}`);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client deleted successfully");
    } catch (err) {
      console.error("Error deleting client:", err);
      toast.error("Error deleting client: " + (err.message || err));
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowCreateModal(true);
  };

  // ---- FILTERING ----
  const filtered = useMemo(() => {
    let items = [...clients];

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();

      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          String(c.phone_number || "")
            .toLowerCase()
            .includes(s) ||
          String(c.email || "")
            .toLowerCase()
            .includes(s)
      );
    }

    return items;
  }, [clients, debouncedSearch]);

  // ---- PAGINATION ----
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
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingClient(null);
        }}
        title={editingClient ? "Edit Client" : "Create New Client"}
      >
        <ClientForm
          initialData={editingClient}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingClient(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingClient(null);
            loadClients();
          }}
        />
      </Modal>


      <Header icon_url="/assets/user.svg" title="Clients" />

      <div className="dashboard">
        {error && (
          <div className="error-banner">
            Error: {error}
            <button onClick={loadClients} style={{ marginLeft: 10 }}>
              Retry
            </button>
          </div>
        )}

        <div className="app-shell">
          <div className="app-header">
            <h2 className="font-subtitle margin-bottom-md">Client List</h2>

            <div className="between margin-bottom-md controls">
              <button className="btn add-btn" onClick={() => setShowCreateModal(true)}>
                + New Client
              </button>

              <div className="search-bar-wrapper">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search Client..."
                  ariaLabel="Search clients"
                />
              </div>
            </div>
          </div>

          <ClientsTable
            items={pageItems}
            onView={handleViewClient}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
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
