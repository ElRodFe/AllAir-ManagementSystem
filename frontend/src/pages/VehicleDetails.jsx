import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import DetailsLayout from "../components/DetailsLayout";
import DetailsSection from "../components/DetailsSection";
import DetailsInfoItem from "../components/DetailsInfoItem";
import OrdersTable from "../components/OrdersTable";
import Pagination from "../components/Paginations";
import Modal from "../components/Modal";
import WorkOrderForm from "../components/WorkOrderForm";
import LoadingSpinner from "../components/LoadingSpinner";
import useDebounce from "../utils/useDebounce";
import { useNotify } from "../contexts/NotificationContext";

import { getVehicleById } from "../services/vehicleService";
import { getClientById } from "../services/clientService";
import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} from "../services/workOrderService";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushNotification } = useNotify();

  const [vehicle, setVehicle] = useState(null);
  const [owner, setOwner] = useState(null);
  const [rawOrders, setRawOrders] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const [loading, setLoading] = useState(true);

  // Load all info
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const v = await getVehicleById(id);
        setVehicle(v);

        const ownerData = await getClientById(v.owner_id);
        setOwner(ownerData);

        const orders = await getWorkOrders();
        const filtered = orders.filter((o) => o.vehicle_id === Number(id));
        setRawOrders(filtered);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // CREATE
  const handleCreate = async (payload) => {
    try {
      await createWorkOrder({ ...payload, vehicle_id: Number(id) });

      const all = await getWorkOrders();
      const filtered = all.filter((o) => o.vehicle_id === Number(id));
      setRawOrders(filtered);

      setShowModal(false);
      setEditingOrder(null);
      pushNotification("Work order created successfully!", "success");
    } catch (err) {}
  };

  // UPDATE
  const handleUpdate = async (payload) => {
    try {
      await updateWorkOrder(editingOrder.id, payload);

      const all = await getWorkOrders();
      const filtered = all.filter((o) => o.vehicle_id === Number(id));
      setRawOrders(filtered);

      setShowModal(false);
      setEditingOrder(null);
      pushNotification("Work order updated!", "success");
    } catch (err) {}
  };

  // DELETE
  const handleDelete = async (orderId) => {
    if (!confirm("Delete this work order?")) {
      pushNotification("Delete canceled.", "info");
      return;
    }

    try {
      await deleteWorkOrder(orderId);

      const all = await getWorkOrders();
      const filtered = all.filter((o) => o.vehicle_id === Number(id));
      setRawOrders(filtered);

      pushNotification("Work order deleted!", "success");
    } catch (err) {}
  };

  // JOIN orders with extra info (same as WorkOrders.jsx)
  const joinedOrders = useMemo(() => {
    return rawOrders.map((o) => ({
      ...o,
      customer_name: owner?.name || "Unknown",
      customer_phone: owner?.phone_number || "—",
      customer_email: owner?.email || "—",
      vehicle_plate: vehicle?.plate_number || "—",
      vehicle_model: vehicle?.brand_model || "—",
      vehicle_type: vehicle?.vehicle_type || "—",
    }));
  }, [rawOrders, owner, vehicle]);

  // SEARCH
  const filteredOrders = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    if (!s) return joinedOrders;

    return joinedOrders.filter(
      (o) =>
        `${o.id}`.includes(s) ||
        (o.customer_name || "").toLowerCase().includes(s) ||
        (o.customer_phone || "").toLowerCase().includes(s) ||
        (o.customer_email || "").toLowerCase().includes(s) ||
        (o.work_status || "").toLowerCase().includes(s) ||
        (o.payment_status || "").toLowerCase().includes(s) ||
        (o.vehicle_plate || "").toLowerCase().includes(s) ||
        (o.details || "").toLowerCase().includes(s)
    );
  }, [joinedOrders, debouncedSearch]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  if (loading || !vehicle) {
    return <LoadingSpinner fullPage message="Loading vehicle details..." />;
  }

  return (
    <>
      {/* CREATE / EDIT ORDER MODAL */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingOrder(null);
        }}
        title={editingOrder ? "Edit Work Order" : "New Work Order"}
      >
        <WorkOrderForm
          clients={[owner]} // owner only
          vehicles={[vehicle]} // this vehicle only
          initialData={editingOrder}
          onSubmit={(payload) => (editingOrder ? handleUpdate(payload) : handleCreate(payload))}
          onCancel={() => {
            setShowModal(false);
            setEditingOrder(null);
          }}
        />
      </Modal>

      {/* HEADER */}
      <Header icon_url="/assets/vehicle.svg" title="Vehicle Details" />

      <DetailsLayout title={`Vehicle #${vehicle.id}`}>
        <div className="back-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* VEHICLE INFO */}
        <DetailsSection title="Information">
          <DetailsInfoItem label="Owner Name" value={owner?.name} />
          <DetailsInfoItem label="Owner ID" value={vehicle.owner_id} />
          <DetailsInfoItem label="Vehicle Type" value={vehicle.vehicle_type} />
          <DetailsInfoItem label="Brand / Model" value={vehicle.brand_model} />
          <DetailsInfoItem label="Plate Number" value={vehicle.plate_number} full />
        </DetailsSection>

        {/* WORK ORDERS */}
        <DetailsSection title="Work Orders">
          <div className="details-info-item full">
            <div className="between margin-bottom-md controls">
              <button
                className="btn add-btn"
                onClick={() => {
                  setEditingOrder(null);
                  setShowModal(true);
                }}
              >
                + Create Order
              </button>

              <SearchBar value={search} onChange={setSearch} placeholder="Search orders..." />
            </div>

            <OrdersTable
              items={pageItems}
              onEdit={(order) => {
                setEditingOrder(order);
                setShowModal(true);
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
        </DetailsSection>
      </DetailsLayout>
    </>
  );
}
