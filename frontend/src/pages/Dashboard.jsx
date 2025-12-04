import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import OrdersTable from "../components/OrdersTable";
import "../styles/pages/Dashboard.css";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import Pagination from "../components/Paginations";
import LoadingSpinner from "../components/LoadingSpinner";
import useDebounce from "../utils/useDebounce";
import Modal from "../components/Modal";
import WorkOrderForm from "../components/WorkOrderForm";
import { useToast } from "../utils/useToast";
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

export default function Dashboard() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [filters, setFilters] = useState({
    payment_status: "",
    work_status: "",
    order: "asc",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    loadData();
  }, []);

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
      console.error("Error loading data:", err);
      setError(err.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Create work order handler
  const handleCreateWorkOrderSubmit = async (formData) => {
    try {
      await createWorkOrder(formData);
      await loadData();
      setShowAddModal(false);
      toast.success("Work order created successfully");
    } catch (err) {
      console.error("Error creating work order:", err);
      toast.error("Error creating order: " + (err.message || err));
    }
  };

  const handleEditWorkOrderSubmit = async (id, formData) => {
    try {
      await updateWorkOrder(id, formData);
      await loadData();
      setEditModalOpen(false);
      setEditingOrder(null);
      toast.success("Work order updated successfully");
    } catch (err) {
      console.error("Error editing work order:", err);
      toast.error("Error editing order: " + (err.message || err));
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setEditModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this work order?")) return;
    try {
      await deleteWorkOrder(id);
      setRawData((prev) => prev.filter((o) => o.id !== id));
      toast.success("Work order deleted successfully");
    } catch (err) {
      console.error("Error deleting work order:", err);
      toast.error("Error deleting work order: " + (err.message || err));
    }
  };

  const ordersWithCustomerInfo = useMemo(() => {
    return rawData.map((order) => {
      const cust = clients.find((c) => c.id === order.client_id);
      const vehicle = vehicles.find((v) => v.id === order.vehicle_id);

      return {
        ...order,
        customer_name: cust ? cust.name : "Unknown",
        customer_phone: cust ? cust.phone_number : "N/A",
        customer_email: cust ? cust.email : "N/A",

        vehicle_plate: vehicle ? vehicle.plate_number : "N/A",
        vehicle_model: vehicle ? vehicle.brand_model : "N/A",
        vehicle_type: vehicle ? vehicle.vehicle_type : "N/A",
      };
    });
  }, [rawData, clients, vehicles]);

  const payment_status = useMemo(() => uniqueValues(rawData, "payment_status"), [rawData]);
  const work_status = useMemo(() => uniqueValues(rawData, "work_status"), [rawData]);

  const filtered = useMemo(() => {
    let items = [...ordersWithCustomerInfo];

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      items = items.filter(
        (it) =>
          `${it.id}`.includes(s) ||
          (it.customer_name || "").toLowerCase().includes(s) ||
          (it.details || "").toLowerCase().includes(s) ||
          (it.spare_parts || "").toLowerCase().includes(s) ||
          (it.vehicle_plate || "").toLowerCase().includes(s) ||
          (it.vehicle_model || "").toLowerCase().includes(s)
      );
    }

    if (filters.payment_status)
      items = items.filter((i) => i.payment_status === filters.payment_status);

    if (filters.work_status) items = items.filter((i) => i.work_status === filters.work_status);

    items.sort((a, b) => {
      const dA = new Date(a.entry_date);
      const dB = new Date(b.entry_date);
      return filters.order === "asc" ? dA - dB : dB - dA;
    });

    return items;
  }, [ordersWithCustomerInfo, filters, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => {
    return {
      total: rawData.length,
      new: rawData.filter((order) => order.work_status === "pending").length,
      completed: rawData.filter((order) => order.work_status === "completed").length,
      pending: rawData.filter(
        (order) => order.payment_status === "NOT_PAID" || order.payment_status === "BILL_SENT"
      ).length,
    };
  }, [rawData]);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." fullPage />;
  }

  return (
    <>
      {/* Add work order modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Work Order">
        <WorkOrderForm
          clients={clients}
          vehicles={vehicles}
          onSubmit={handleCreateWorkOrderSubmit}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit work order modal */}
      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit Work Order">
        {editingOrder && (
          <WorkOrderForm
            clients={clients}
            vehicles={vehicles}
            initialData={editingOrder}
            onSubmit={(formData) => handleEditWorkOrderSubmit(editingOrder.id, formData)}
            onCancel={closeEditModal}
          />
        )}
      </Modal>

      <Header icon_url="assets/board.svg" title="Dashboard" />

      <div className="dashboard">
        {error && (
          <div className="error-banner">
            Error: {error}
            <button onClick={loadData} style={{ marginLeft: "10px" }}>
              Retry
            </button>
          </div>
        )}

        <h2 className="font-title margin-bottom-md">Overview</h2>

        <div className="overview-box flex">
          <StatCard
            icon_url="assets/total_orders.svg"
            label="Total Orders"
            value={stats.total}
            color="orange"
          />
          <StatCard
            icon_url="assets/new_orders.svg"
            label="New Orders"
            value={stats.new}
            color="blue"
          />
          <StatCard
            icon_url="assets/completed_orders.svg"
            label="Completed Orders"
            value={stats.completed}
            color="green"
          />
          <StatCard
            icon_url="assets/pending_orders.svg"
            label="Pending Orders"
            value={stats.pending}
            color="red"
          />
        </div>

        <h2 className="font-title margin-bottom-lg">Activity Feed</h2>

        <div className="app-shell">
          <button className="add-btn btn" onClick={() => setShowAddModal(true)}>
            + New Order
          </button>

          <h3 className="font-subtitle margin-bottom-md">Latest Pending Orders</h3>

          <div className="controls between">
            <Filters
              payment_status={payment_status}
              work_status={work_status}
              selected={filters}
              onChange={(newFilters) => {
                setFilters(newFilters);
                setPage(1);
              }}
            />

            <div className="search-bar-wrapper">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>

          <OrdersTable items={pageItems} onEdit={openEditModal} onDelete={handleDelete} />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(Math.max(1, Math.min(totalPages, p)))}
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
