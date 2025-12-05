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
import { useNavigate } from "react-router-dom";
import { useToast } from "../utils/useToast";

import { getClientById } from "../services/clientService";
import { getVehicles, deleteVehicle } from "../services/vehicleService";

const navigate = useNavigate();

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  // search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const c = await getClientById(id);
        const allVehicles = await getVehicles();
        const owned = allVehicles.filter((v) => v.owner_id === Number(id));

        setClient(c);
        setVehicles(owned);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // SEARCH FILTER
  const filteredVehicles = useMemo(() => {
    if (!debouncedSearch) return vehicles;

    const s = debouncedSearch.toLowerCase();

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

  const pagedVehicles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, page, pageSize]);

  // table actions
  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await deleteVehicle(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      toast.success("Vehicle deleted successfully");
    } catch (err) {
      toast.error("Error deleting vehicle");
    }
  };

  return (
    <>
      {/* Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingVehicle(null);
        }}
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
      >
        <VehicleForm
          clientId={id}
          vehicle={editingVehicle}
          onSuccess={async () => {
            // Reload vehicles after create/update
            const all = await getVehicles();
            setVehicles(all.filter(v => v.owner_id === Number(id)));

            setShowEditModal(false);
            setEditingVehicle(null);
          }}
        />
      </Modal>

      <Header icon_url="/assets/user.svg" title="Client Details" />

      <div style={{ 
        margin: '2rem 0', 
        display: 'flex', 
        justifyContent: 'center',
        padding: '0 2rem'
      }}>
        <button 
          className="btn-back" 
          onClick={() => navigate('/clients')}
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
          ← Back to Clients
        </button>
      </div>

      <DetailsLayout title={client ? `Client #${client.id}` : "Client Details"}>
        {loading || !client ? (
          <LoadingSpinner message="Loading client details..." />
        ) : (
          <>
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
                      setEditingVehicle(null); // create mode
                      setShowEditModal(true);
                    }}
                  >
                    + Add Vehicle
                  </button>

                  <div className="search-bar-wrapper">
                    <SearchBar
                      value={search}
                      onChange={setSearch}
                      placeholder="Search vehicles..."
                    />
                  </div>
                </div>
                <VehiclesTable
                  items={pagedVehicles}
                  onView={(v) => (navigate(`/vehicle/${v.id}`))}
                  onEdit={handleEditVehicle}
                  onDelete={handleDeleteVehicle}
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
