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
import { useNotify } from "../contexts/NotificationContext";

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
  const { pushNotification } = useNotify();

  const [user, setUser] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UNIFIED MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    payment_status: "",
    work_status: "",
    order: "asc",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Load user + data
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
      setError("Error loading dashboard data");
      pushNotification("Error loading dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // CREATE WORK ORDER
  const handleCreate = async (formData) => {
    try {
      await createWorkOrder(formData);
      await loadData();
      setModalOpen(false);
      pushNotification("Work order created successfully!", "success");
    } catch (err) {}
  };

  // EDIT WORK ORDER
  const handleEdit = async (id, formData) => {
    try {
      await updateWorkOrder(id, formData);
      await loadData();
      setModalOpen(false);
      setEditingOrder(null);
      pushNotification("Work order updated successfully!", "success");
    } catch (err) {}
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setModalOpen(false);
    pushNotification("Action canceled.", "info");
  };

  // DELETE WORK ORDER
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this work order?")) {
      pushNotification("Delete canceled.", "info");
      return;
    }

    try {
      await deleteWorkOrder(id);
      setRawData((prev) => prev.filter((o) => o.id !== id));
      pushNotification("Work order deleted!", "success");
    } catch (err) {}
  };

  // JOIN CLIENT + VEHICLE INFO
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

  // SEARCH + FILTER + SORT
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
      const da = new Date(a.entry_date);
      const db = new Date(b.entry_date);
      return filters.order === "asc" ? da - db : db - da;
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
      {/* UNIFIED CREATE/EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={closeEditModal}
        title={editingOrder ? "Edit Work Order" : "Add Work Order"}
      >
        <WorkOrderForm
          clients={clients}
          vehicles={vehicles}
          initialData={editingOrder}
          onSubmit={(formData) =>
            editingOrder ? handleEdit(editingOrder.id, formData) : handleCreate(formData)
          }
          onCancel={closeEditModal}
        />
      </Modal>

      <Header icon_url="assets/board.svg" title="Dashboard" />

      <div className="dashboard">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={loadData} style={{ marginLeft: 10 }}>
              Retry
            </button>
          </div>
        )}

        {/* --------- OVERVIEW --------- */}
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

        {/* --------- WORK ORDERS LIST --------- */}
        <h2 className="font-title margin-bottom-lg">Activity Feed</h2>

        <div className="app-shell">
          <button
            className="btn add-btn"
            onClick={() => {
              setEditingOrder(null);
              setModalOpen(true);
            }}
          >
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

            <SearchBar value={search} onChange={setSearch} />
          </div>

          <OrdersTable
            items={pageItems}
            onEdit={(order) => {
              setEditingOrder(order);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
          />

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
