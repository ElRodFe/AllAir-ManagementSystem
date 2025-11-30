import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import Pagination from '../components/Paginations';
import OrdersTable from '../components/OrdersTable';
import useDebounce from '../utils/useDebounce';
import { getWorkOrders, getClients, createWorkOrder, editWorkOrder, deleteWorkOrder } from '../utils/api';
import Modal from '../components/Modal';

function uniqueValues(items, key) {
  return Array.from(new Set(items.map(i => i[key]).filter(Boolean))).sort();
}

export default function WorkOrders() {
  const navigate = useNavigate();
  const [rawData, setRawData] = useState([]);
  const [realClients, setRealClients] = useState([]);
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientVehicles, setClientVehicles] = useState([]);
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load Order Data
  useEffect(() => { loadData(); }, []);

  // Joined Tables
  const ordersWithCustomerInfo = useMemo(() => {
    return rawData.map(order => {
      const cust = realClients.find(c => `${c.id}` === `${order.client_id}`);

      return {
        ...order,
        customer_name: cust?.name || "",
        customer_phone: cust?.phone_number || "",
        customer_email: cust?.email || ""
      };
    });
  }, [rawData, realClients]);

  const payment_status = useMemo(() => uniqueValues(rawData, "payment_status"), [rawData]);
  const work_status = useMemo(() => uniqueValues(rawData, "work_status"), [rawData]);

  // Search Filter and Sorting
  const filtered = useMemo(() => {
    let items = [...ordersWithCustomerInfo]; 

    // Search
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      items = items.filter(it =>
        `${it.id}`.toLowerCase().includes(s) ||
        (it.customer_name || '').toLowerCase().includes(s) ||
        (it.details || '').toLowerCase().includes(s) ||
        (it.spare_parts || '').toLowerCase().includes(s)
      );
    }

    // Filter
    if (filters.payment_status)
      items = items.filter(i => i.payment_status === filters.payment_status);

    if (filters.work_status)
      items = items.filter(i => i.work_status === filters.work_status);

    // Sorting
    items.sort((a, b) => {
      const dA = new Date(a.entry_date);
      const dB = new Date(b.entry_date);
      return filters.order === "asc" ? dA - dB : dB - dA;
    });

    return items;
  }, [ordersWithCustomerInfo, filters, debouncedSearch]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Create work order
    const handleCreateWorkOrderSubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
  
      const data = {
        entry_date: form.entry_date.value,
        egress_date: form.egress_date.value || null,
        client_id: Number(form.client_id.value),
        vehicle_id: Number(form.vehicle_id.value),
        work_status: form.work_status.value,
        payment_status: form.payment_status.value,
        refrigerant_gas_retrieved: form.refrigerant_gas_retrieved.value ? Number(form.refrigerant_gas_retrieved.value) : null,
        refrigerant_gas_injected: form.refrigerant_gas_injected.value ? Number(form.refrigerant_gas_injected.value) : null,
        oil_retrieved: form.oil_retrieved.value ? Number(form.oil_retrieved.value) : null,
        oil_injected: form.oil_injected.value ? Number(form.oil_injected.value) : null,
        detector: form.detector.value === "" ? null : form.detector.value === "true",
        spare_parts: form.spare_parts.value || null,
        details: form.details.value || null,
        workers: form.workers.value,
        hours: form.hours.value ? Number(form.hours.value) : null,
      };
  
      try {
        await createWorkOrder(data);
        await loadData();
        closeModal();
      } catch (err) {
        console.error("Error creating work order:", err);
        alert("Error creating order: " + err.message);
      }
    };
  
    // Update work order
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
  
    const openEditModal = (order) => {
      setEditingOrder(order);
      const cust = realClients.find(c => c.id === order.client_id);
      setSelectedClient(cust || null);
      setEditModalOpen(true);
    };
  
    const closeEditModal = () => {
      setEditingOrder(null);
      setEditModalOpen(false);
    };
  
    // Delete work order
    const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this work order?")) {
        try {
          await deleteWorkOrder(id);
          setRawData(prev => prev.filter(o => o.id !== id)); 
          alert("Work order deleted successfully!");
        } catch (err) {
          console.error("Error deleting work order:", err);
          alert("Error deleting work order: " + err.message);
        }
      }
    };

  return (
    <>
      {/* Modal to Create Work Order */}
      <Modal
        open={showAddModal}
        onClose={closeModal}
        title="Add Work Order"
      >
        <form className="modal-form" onSubmit={handleCreateWorkOrderSubmit}>

          {/* ==================== DATES ==================== */}
          <label>
            Entry Date:
            <input type="date" name="entry_date" required />
          </label>

          <label>
            Egress Date (optional):
            <input type="date" name="egress_date" />
          </label>

          {/* ==================== FOREIGN KEYS ==================== */}
          <label>
            Search client by name:
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => {
                const text = e.target.value;
                setClientSearch(text);

                const found = realClients.find(c =>
                c.name.toLowerCase().includes(text.toLowerCase())
              );

                setSelectedClient(found || null);

                if (found) {
                  fetch(`http://localhost:8000/clients/${found.id}/vehicles`)
                    .then(res => res.json())
                    .then(setClientVehicles)
                    .catch(console.error);
                } else {
                  setClientVehicles([]);
                }
              }}
              placeholder="Example: Annie Brooks"
              required
            />
          </label>

          {selectedClient && (
            <input
              type="hidden"
              name="client_id"
              value={selectedClient.id}
            />
          )}
            
          {selectedClient && (
            <p style={{ fontWeight: "bold", marginTop: "4px" }}>
              Selected client: {selectedClient.name} (ID {selectedClient.id})
            </p>
          )}

          <label>
            Vehicle:
            <select name="vehicle_id" required disabled={!clientVehicles.length}>
              <option value="">Choose a vehicle</option>
              {clientVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.plate_number} — {v.brand_model}
                </option>
              ))}
            </select>
          </label>

          {/* ==================== STATUS FIELDS ==================== */}
          <label>
            Work Status:
            <select name="work_status" required>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label>
            Payment Status:
            <select name="payment_status" required>
              <option value="NOT_PAID">Not Paid</option>
              <option value="PAID">Paid</option>
              <option value="BILL_SENT">Bill Sent</option>
              <option value="NOT_REQUESTED">Not Requested</option>
            </select>
          </label>

          {/* ==================== GAS & OIL ==================== */}
          <label>
            Refrigerant Gas Retrieved (g):
            <input type="number" name="refrigerant_gas_retrieved" />
          </label>

          <label>
            Refrigerant Gas Injected (g):
            <input type="number" name="refrigerant_gas_injected" />
          </label>

          <label>
            Oil Retrieved (ml):
            <input type="number" name="oil_retrieved" />
          </label>

          <label>
            Oil Injected (ml):
            <input type="number" name="oil_injected" />
          </label>

          {/* ==================== DETECTOR ==================== */}
          <label>
            Detector Used:
            <select name="detector">
              <option value="">Select...</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          {/* ==================== SERVICE DETAILS ==================== */}
          <label>
            Spare Parts:
            <textarea name="spare_parts"></textarea>
          </label>

          <label>
            Details:
            <textarea name="details"></textarea>
          </label>

          {/* ==================== WORK INFO ==================== */}
          <label>
            Workers (required):
            <input type="text" name="workers" required />
          </label>

          <label>
            Hours Worked:
            <input type="number" name="hours" />
          </label>

          {/* ==================== ACTIONS ==================== */}
          <div className="modal-actions">
            <button type="button" onClick={closeModal}>Cancel</button>
            <button type="submit">Create</button>
          </div>
        </form>
      </Modal>
      {/* Modal to Update Work Order */}
      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit Work Order">
        {editingOrder && (
          <form
            className="modal-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;

              const data = {
                entry_date: form.entry_date.value,
                egress_date: form.egress_date.value || null,
                client_id: selectedClient ? selectedClient.id : null,
                vehicle_id: Number(form.vehicle_id.value),
                work_status: form.work_status.value,
                payment_status: form.payment_status.value,
                refrigerant_gas_retrieved: form.refrigerant_gas_retrieved.value ? Number(form.refrigerant_gas_retrieved.value) : null,
                refrigerant_gas_injected: form.refrigerant_gas_injected.value ? Number(form.refrigerant_gas_injected.value) : null,
                oil_retrieved: form.oil_retrieved.value ? Number(form.oil_retrieved.value) : null,
                oil_injected: form.oil_injected.value ? Number(form.oil_injected.value) : null,
                detector: form.detector.value === "" ? null : form.detector.value === "true",
                spare_parts: form.spare_parts.value || null,
                details: form.details.value || null,
                workers: form.workers.value,
                hours: form.hours.value ? Number(form.hours.value) : null,
              };

              try {
                await editWorkOrder(editingOrder.id, data);
                await loadData();
                closeEditModal();
              } catch (err) {
                console.error("Error editing work order:", err);
                alert("Error editing order: " + err.message);
              }
            }}
          >
            {/* ==================== DATES ==================== */}
            <label>
              Entry Date:
              <input type="date" name="entry_date" defaultValue={editingOrder.entry_date} required />
            </label>

            <label>
              Egress Date:
              <input type="date" name="egress_date" defaultValue={editingOrder.egress_date || ""} />
            </label>

            {/* ==================== FOREIGN KEYS ==================== */}
            <label>
              Client ID:
              <input type="number" name="client_id" defaultValue={editingOrder.client_id} required />
            </label>

            <label>
              Vehicle ID:
              <input type="number" name="vehicle_id" defaultValue={editingOrder.vehicle_id} required />
            </label>

            {/* ==================== STATUS FIELDS ==================== */}
            <label>
              Work Status:
              <select name="work_status" defaultValue={editingOrder.work_status} required>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label>
              Payment Status:
              <select name="payment_status" defaultValue={editingOrder.payment_status} required>
                <option value="NOT_PAID">Not Paid</option>
                <option value="PAID">Paid</option>
                <option value="BILL_SENT">Bill Sent</option>
                <option value="NOT_REQUESTED">Not Requested</option>
              </select>
            </label>

            {/* ==================== GAS & OIL ==================== */}
            <label>
              Refrigerant Gas Retrieved (g):
              <input type="number" name="refrigerant_gas_retrieved" defaultValue={editingOrder.refrigerant_gas_retrieved || ""} />
            </label>

            <label>
              Refrigerant Gas Injected (g):
              <input type="number" name="refrigerant_gas_injected" defaultValue={editingOrder.refrigerant_gas_injected || ""} />
            </label>

            <label>
              Oil Retrieved (ml):
              <input type="number" name="oil_retrieved" defaultValue={editingOrder.oil_retrieved || ""} />
            </label>

            <label>
              Oil Injected (ml):
              <input type="number" name="oil_injected" defaultValue={editingOrder.oil_injected || ""} />
            </label>

            {/* ==================== DETECTOR ==================== */}
            <label>
              Detector Used:
              <select name="detector" defaultValue={editingOrder.detector === null ? "" : editingOrder.detector.toString()}>
                <option value="">Select...</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>

            {/* ==================== SERVICE DETAILS ==================== */}
            <label>
              Spare Parts:
              <textarea name="spare_parts" defaultValue={editingOrder.spare_parts || ""}></textarea>
            </label>

            <label>
              Details:
              <textarea name="details" defaultValue={editingOrder.details || ""}></textarea>
            </label>

            {/* ==================== WORK INFO ==================== */}
            <label>
              Workers (required):
              <input type="text" name="workers" defaultValue={editingOrder.workers} required />
            </label>

            <label>
              Hours Worked:
              <input type="number" name="hours" defaultValue={editingOrder.hours || ""} />
            </label>

            {/* ==================== ACTIONS ==================== */}
            <div className="modal-actions">
              <button type="button" onClick={closeEditModal}>Cancel</button>
              <button type="submit">Save</button>
            </div>
          </form>
        )}
      </Modal>
      <Header icon_url="assets/order.svg" title="Work Orders" username="John Doe" />

      <div className="work-orders-page">
        <div className="page-header">
          <h2 className="font-title">All Work Orders</h2>
           <button 
              className="add-order-btn"
              onClick={handleAddWorkOrder}
            >
              + Add Work Order
            </button>
        </div>

        <div className="app-shell">
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

          <OrdersTable
            items={pageItems}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />

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
