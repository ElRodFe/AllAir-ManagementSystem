import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import DetailsLayout from "../components/DetailsLayout";
import DetailsSection from "../components/DetailsSection";
import DetailsInfoItem from "../components/DetailsInfoItem";
import VehiclesTable from "../components/VehiclesTable";
import Pagination from "../components/Paginations";
import Modal from "../components/Modal";
import useDebounce from "../utils/useDebounce";

import { getClientById } from "../services/clientService";
import { getVehicles, deleteVehicle } from "../services/vehicleService";

export default function ClientProfile() {
  const { id } = useParams();

  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_type: "",
    brand_model: "",
    kilometers: 0,
    plate_number: "",
  });

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
      alert("Vehicle deleted");
    } catch (err) {
      alert("Error deleting vehicle");
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
        <div>
          <p>{editingVehicle ? "Edit Vehicle Form Goes Here" : "New Vehicle Form Goes Here"}</p>
        </div>
      </Modal>

      <Header icon_url="/assets/user.svg" title="Client Details" />

      <DetailsLayout title={client ? `Client #${client.id}` : "Client Details"}>
        {loading || !client ? (
          <p>Loading client...</p>
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
                  onView={(v) => (window.location.href = `/vehicle/${v.id}`)}
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
