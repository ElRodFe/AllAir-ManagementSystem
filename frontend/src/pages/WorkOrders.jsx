import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import Pagination from "../components/Paginations";
import OrdersTable from "../components/OrdersTable";
import Modal from "../components/Modal";
import WorkOrderForm from "../components/WorkOrderForm";
import LoadingSpinner from "../components/LoadingSpinner";
import useDebounce from "../utils/useDebounce";
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

export default function WorkOrders() {
  const { pushNotification } = useNotify();

  const [rawData, setRawData] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [filters, setFilters] = useState({
    payment_status: "",
    work_status: "",
    order: "asc",
  });

  const [loading, setLoading] = useState(true);

  // UNIFIED MODAL STATE
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load work orders + relations
  const loadData = async () => {
    setLoading(true);
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
      pushNotification("Error loading work orders.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CREATE ORDER
  const handleCreate = async (payload) => {
    try {
      await createWorkOrder(payload);
      await loadData();
      setModalOpen(false);
      pushNotification("Work order created successfully!", "success");
    } catch (err) {}
  };

  // EDIT ORDER
  const handleEdit = async (id, payload) => {
    try {
      await updateWorkOrder(id, payload);
      await loadData();
      setModalOpen(false);
      setEditingOrder(null);
      pushNotification("Work order updated successfully!", "success");
    } catch (err) {}
  };

  // DELETE ORDER
  const handleDelete = async (id) => {
    if (!confirm("Delete this work order?")) {
      pushNotification("Delete canceled.", "info");
      return;
    }

    try {
      await deleteWorkOrder(id);
      await loadData();
      pushNotification("Work order deleted!", "success");
    } catch (err) {}
  };

  // JOIN_CLIENT + VEHICLE DATA
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

  // APPLY SEARCH + FILTERS + SORT
  const filtered = useMemo(() => {
    let items = [...joinedOrders];

    const s = debouncedSearch.toLowerCase();
    if (s) {
      items = items.filter(
        (i) =>
          `${i.id}`.includes(s) ||
          (i.customer_name || "").toLowerCase().includes(s) ||
          (i.details || "").toLowerCase().includes(s) ||
          (i.vehicle_plate || "").toLowerCase().includes(s) ||
          (i.vehicle_model || "").toLowerCase().includes(s) ||
          (i.customer_phone || "").toLowerCase().includes(s)
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
  }, [joinedOrders, filters, debouncedSearch]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // IF LOADING
  if (loading) {
    return <LoadingSpinner fullPage message="Loading work orders..." />;
  }

  return (
    <>
      {/* UNIFIED CREATE/EDIT WORK ORDER MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingOrder(null);
          pushNotification("Action canceled.", "info");
        }}
        title={editingOrder ? "Edit Work Order" : "New Work Order"}
      >
        <WorkOrderForm
          clients={clients}
          vehicles={vehicles}
          initialData={editingOrder}
          onSubmit={(payload) =>
            editingOrder ? handleEdit(editingOrder.id, payload) : handleCreate(payload)
          }
          onCancel={() => {
            setModalOpen(false);
            setEditingOrder(null);
            pushNotification("Action canceled.", "info");
          }}
        />
      </Modal>

      {/* HEADER */}
      <Header icon_url="/assets/order.svg" title="Work Orders" />

      <div className="dashboard">
        <div className="app-shell">
          {/* PAGE HEADER */}
          <div className="page-header margin-bottom-md between">
            <h2 className="font-subtitle">Order List</h2>
            <button
              className="btn add-btn"
              onClick={() => {
                setEditingOrder(null);
                setModalOpen(true);
              }}
            >
              + New Order
            </button>
          </div>

          {/* FILTERS + SEARCH */}
          <div className="controls between">
            <Filters
              payment_status={uniqueValues(rawData, "payment_status")}
              work_status={uniqueValues(rawData, "work_status")}
              selected={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(1);
              }}
            />

            <SearchBar value={search} onChange={setSearch} />
          </div>

          {/* TABLE */}
          <OrdersTable
            items={pageItems}
            onEdit={(order) => {
              setEditingOrder(order);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
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
