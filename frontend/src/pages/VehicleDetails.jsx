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
import LoadingSpinner from "../components/LoadingSpinner";
import useDebounce from "../utils/useDebounce";

import { getVehicleById } from "../services/vehicleService";
import { getClientById } from "../services/clientService";
import { getWorkOrders } from "../services/workOrderService";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [owner, setOwner] = useState(null);
  const [orders, setOrders] = useState([]);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  // modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const v = await getVehicleById(id);
        setVehicle(v);

        const c = await getClientById(v.owner_id);
        setOwner(c);

        const all = await getWorkOrders();
        setOrders(all.filter((o) => o.vehicle_id === Number(id)));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // SEARCH FILTER
  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders;
    const s = debouncedSearch.toLowerCase();

    return orders.filter((o) => {
      return (
        `${o.id}`.includes(s) ||
        (o.customer_name || "").toLowerCase().includes(s) ||
        (o.work_status || "").toLowerCase().includes(s) ||
        (o.payment_status || "").toLowerCase().includes(s) ||
        (o.vehicle_plate || "").toLowerCase().includes(s) ||
        (o.details || "").toLowerCase().includes(s)
      );
    });
  }, [orders, debouncedSearch]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  // Modal actions
  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowEditModal(true);
  };

  return (
    <>
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingOrder(null);
        }}
        title={editingOrder ? "Edit Work Order" : "Edit Vehicle"}
      >
        <p>{editingOrder ? "Edit Work Order Form Goes Here" : "Edit Vehicle Form Goes Here"}</p>
      </Modal>

      <Header icon_url="/assets/vehicle.svg" title="Vehicle Details" />

      <div style={{ 
        margin: '2rem 0', 
        display: 'flex', 
        justifyContent: 'center',
        padding: '0 2rem'
      }}>
        <button 
          className="btn-back" 
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--color-green-400)',
            color: 'var(--color-green-600)',
            border: '2px solid var(--color-green-500)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'var(--color-green-500)';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateX(-3px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'var(--color-green-400)';
            e.target.style.color = 'var(--color-green-600)';
            e.target.style.transform = 'translateX(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          ← Back
        </button>
      </div>

      <DetailsLayout title={vehicle ? `Vehicle #${vehicle.id}` : "Vehicle Details"}>
        {loading || !vehicle ? (
          <LoadingSpinner message="Loading vehicle details..." />
        ) : (
          <>
            <DetailsSection title="Information">
              <DetailsInfoItem label="Owner Name" value={owner?.name} />
              <DetailsInfoItem label="Owner ID" value={vehicle.owner_id} />
              <DetailsInfoItem label="Vehicle Type" value={vehicle.vehicle_type} />
              <DetailsInfoItem label="Brand / Model" value={vehicle.brand_model} />
              <DetailsInfoItem label="Plate Number" value={vehicle.plate_number} full />
            </DetailsSection>

            <DetailsSection title="Work Orders Related">
              <div className="details-info-item full">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search work orders..."
                />
                <OrdersTable
                  items={pagedOrders}
                  onEdit={handleEditOrder}
                  onDelete={() => alert("Delete work order later")}
                />
              </div>

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
            </DetailsSection>
          </>
        )}
      </DetailsLayout>
    </>
  );
}
