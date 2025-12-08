import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import DetailsLayout from "../components/DetailsLayout";
import DetailsSection from "../components/DetailsSection";
import DetailsInfoItem from "../components/DetailsInfoItem";
import VehiclesTable from "../components/VehiclesTable";
import Pagination from "../components/Paginations";
import Modal from "../components/Modal";
import VehicleForm from "../components/VehicleForm";
import LoadingSpinner from "../components/LoadingSpinner";
import useDebounce from "../utils/useDebounce";
import { useNotify } from "../contexts/NotificationContext";

import { getClientById } from "../services/clientService";

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../services/vehicleService";

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushNotification } = useNotify();

  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  // Load client + vehicles
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const c = await getClientById(id);
        const all = await getVehicles();
        const owned = all.filter((v) => v.owner_id === Number(id));

        setClient(c);
        setVehicles(owned);
      } catch (err) {
        pushNotification("Error loading client details.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // CREATE VEHICLE
  const handleCreate = async (payload) => {
    try {
      await createVehicle({ ...payload, owner_id: Number(id) });

      const all = await getVehicles();
      setVehicles(all.filter((v) => v.owner_id === Number(id)));

      setShowModal(false);
      setEditingVehicle(null);

      pushNotification("Vehicle created successfully!", "success");
    } catch (err) {}
  };

  // UPDATE VEHICLE
  const handleUpdate = async (payload) => {
    try {
      await updateVehicle(editingVehicle.id, payload);

      const all = await getVehicles();
      setVehicles(all.filter((v) => v.owner_id === Number(id)));

      setShowModal(false);
      setEditingVehicle(null);

      pushNotification("Vehicle updated successfully!", "success");
    } catch (err) {}
  };

  // DELETE VEHICLE
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Delete this vehicle?")) {
      pushNotification("Delete canceled.", "info");
      return;
    }

    try {
      await deleteVehicle(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

      pushNotification("Vehicle deleted!", "success");
    } catch (err) {}
  };

  // SEARCH
  const filteredVehicles = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    if (!s) return vehicles;

    return vehicles.filter((v) => {
      return (
        `${v.id}`.includes(s) ||
        (v.vehicle_type || "").toLowerCase().includes(s) ||
        (v.brand_model || "").toLowerCase().includes(s) ||
        (v.plate_number || "").toLowerCase().includes(s) ||
        `${v.kilometers || ""}`.toLowerCase().includes(s)
      );
    });
  }, [vehicles, debouncedSearch]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, page, pageSize]);

  if (loading || !client) {
    return <LoadingSpinner fullPage message="Loading client details..." />;
  }

  return (
    <>
      {/* CREATE/EDIT VEHICLE MODAL */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingVehicle(null);
          pushNotification("Action canceled.", "info");
        }}
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={(payload) => (editingVehicle ? handleUpdate(payload) : handleCreate(payload))}
          onCancel={() => {
            setShowModal(false);
            setEditingVehicle(null);
            pushNotification("Action canceled.", "info");
          }}
        />
      </Modal>

      {/* HEADER */}
      <Header icon_url="/assets/user.svg" title="Client Details" />

      <DetailsLayout title={`Client #${client.id}`}>
        <div className="back-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        <DetailsSection title="Information">
          <DetailsInfoItem label="Full Name" value={client.name} full />
          <DetailsInfoItem label="Phone Number" value={client.phone_number} />
          <DetailsInfoItem label="Email Address" value={client.email} />
        </DetailsSection>

        {/* VEHICLES */}
        <DetailsSection title="Vehicles Owned">
          <div className="details-info-item full">
            <div className="between margin-bottom-md controls">
              <button
                className="btn add-btn"
                onClick={() => {
                  setEditingVehicle(null);
                  setShowModal(true);
                }}
              >
                + Add Vehicle
              </button>

              <div className="search-bar-wrapper">
                <SearchBar value={search} onChange={setSearch} placeholder="Search vehicles..." />
              </div>
            </div>

            <VehiclesTable
              items={pageItems}
              onView={(v) => navigate(`/vehicle/${v.id}`)}
              onEdit={(veh) => {
                setEditingVehicle(veh);
                setShowModal(true);
              }}
              onDelete={handleDeleteVehicle}
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
