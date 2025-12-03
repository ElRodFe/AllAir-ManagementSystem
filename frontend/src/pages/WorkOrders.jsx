import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import Pagination from "../components/Paginations";
import OrdersTable from "../components/OrdersTable";
import Modal from "../components/Modal";
import WorkOrderForm from "../components/WorkOrderForm";
import useDebounce from "../utils/useDebounce";

import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} from "../services/workOrderService";
import { getClients } from "../services/clientService";
import { getVehicles } from "../services/vehicleService";

function uniqueValues(items, key) {
  return Array.from(new Set(items.map((i) => i[key]).filter(Boolean))).sort();
}

export default function WorkOrders() {
  const [rawData, setRawData] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [showAddModal, setShowAddModal] = useState(false);
  const handleAddWorkOrder = () => setShowAddModal(true);
  const closeModal = () => setShowAddModal(false);

  const loadData = async () => {
    try {
      const [ordersData, clientsData] = await Promise.all([
        getWorkOrders(),
        getClients()
      ]);
      setRawData(ordersData);
      setRealClients(clientsData);
    } catch (err) {
      console.error(err);
    }
  };

  const [filters, setFilters] = useState({
    payment_status: "",
    work_status: "",
    order: "asc",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load everything
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ordersData, clientsData, vehiclesData] = await Promise.all([
        getWorkOrders(),
        getClients(),
        getVehicles(),
      ]);

      setRawData(ordersData || []);
      setClients(clientsData || []);
      setVehicles(vehiclesData || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle CRUD
  const handleCreate = async (formData) => {
    try {
      await createWorkOrder(formData);
      await loadData();
      setShowAddModal(false);
      alert("Work order created successfully");
    } catch (err) {
      alert("Failed to create work order: " + err.message);
    }
  };

  const handleEdit = async (id, formData) => {
    try {
      await updateWorkOrder(id, formData);
      await loadData();
      setEditModalOpen(false);
      setEditingOrder(null);
      alert("Work order updated");
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this work order?")) return;
    try {
      await deleteWorkOrder(id);
      await loadData();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  // Join data: clients + vehicles
  const joinedOrders = useMemo(() => {
    return rawData.map((o) => {
      const client = clients.find((c) => c.id === o.client_id);
      const vehicle = vehicles.find((v) => v.id === o.vehicle_id);
      return {
        ...o,
        customer_name: client?.name || "Unknown",
        customer_phone: client?.phone_number || "N/A",
        customer_email: client?.email || "N/A",
        vehicle_plate: vehicle?.plate_number || "N/A",
        vehicle_model: vehicle?.brand_model || "N/A",
        vehicle_type: vehicle?.vehicle_type || "N/A",
      };
    });
  }, [rawData, clients, vehicles]);

  // Filters
  const payment_status = useMemo(() => uniqueValues(rawData, "payment_status"), [rawData]);
  const work_status = useMemo(() => uniqueValues(rawData, "work_status"), [rawData]);

  // Full filtering + search + sorting
  const filtered = useMemo(() => {
    let items = [...joinedOrders];

    // Search
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      items = items.filter(
        (it) =>
          `${it.id}`.includes(s) ||
          it.customer_name.toLowerCase().includes(s) ||
          (it.details || "").toLowerCase().includes(s) ||
          (it.vehicle_plate || "").toLowerCase().includes(s)
      );
    }

    // Filters
    if (filters.payment_status) {
      items = items.filter((i) => i.payment_status === filters.payment_status);
    }
    if (filters.work_status) {
      items = items.filter((i) => i.work_status === filters.work_status);
    }

    // Sorting
    items.sort((a, b) => {
      const dA = new Date(a.entry_date);
      const dB = new Date(b.entry_date);
      return filters.order === "asc" ? dA - dB : dB - dA;
    });

    return items;
  }, [joinedOrders, filters, debouncedSearch]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Loading state
  if (loading) {
    return <div className="loading">Loading work orders…</div>;
  }

  return (
    <>
      {/* Create modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="New Work Order">
        <WorkOrderForm
          clients={clients}
          vehicles={vehicles}
          onSubmit={handleCreate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Work Order">
        {editingOrder && (
          <WorkOrderForm
            clients={clients}
            vehicles={vehicles}
            initialData={editingOrder}
            onSubmit={(data) => handleEdit(editingOrder.id, data)}
            onCancel={() => setEditModalOpen(false)}
          />
        )}
      </Modal>

      <Header icon_url="assets/order.svg" title="Work Orders" />

      <div className="dashboard">
        <div className="app-shell">
          <div className="page-header">
            <h2 className="font-subtitle margin-bottom-md">Order List</h2>

            <button className="btn add-btn" onClick={() => setShowAddModal(true)}>
              + New Order
            </button>
          </div>

          <div className="controls between">
            <Filters
              payment_status={payment_status}
              work_status={work_status}
              selected={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(1);
              }}
            />

            <SearchBar value={search} onChange={setSearch} />
          </div>

          <OrdersTable
            items={pageItems}
            onEdit={(order) => {
              setEditingOrder(order);
              setEditModalOpen(true);
            }}
            onDelete={handleDelete}
          />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            pageSize={pageSize}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </div>
      </div>
    </>
  );
}
