import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Modal from "../components/Modal";
import { editWorkOrder } from '../utils/api';
import { getWorkOrderById, getClientById, deleteWorkOrder } from '../utils/api';

export default function WorkOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWorkOrder() {
      try {
        setLoading(true);
        
        // Find work order by ID
        const order = await getWorkOrderById(id);
        
        if (!order) {
          setError('Work order not found');
          setLoading(false);
          return;
        }
        
        // Find associated customer
        const cust = await getClientById(order.client_id);
        
        setWorkOrder(order);
        setCustomer(cust || null);
        setLoading(false);
      } catch (e) {
        setError('Failed to load work order');
        setLoading(false);
      }
    }
    
    loadWorkOrder();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const openEditModal = () => {
    setEditingOrder(workOrder);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <>
        <Header icon_url="assets/order.svg" title="Work Order" username="John Doe" />
        <div className="work-order-page">
          <div className="loading">Loading work order...</div>
        </div>
      </>
    );
  }

  if (error || !workOrder) {
    return (
      <>
        <Header icon_url="assets/order.svg" title="Work Order" username="John Doe" />
        <div className="work-order-page">
          <div className="error-message">{error || 'Work order not found'}</div>
          <button onClick={() => navigate('/')}>Back to Dashboard</button>
        </div>
      </>
    );
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this work order?")) {
      try {
        await deleteWorkOrder(workOrder.id);
        alert("Work order deleted successfully!");
        navigate('/');
      } catch (err) {
        console.error("Error deleting work order:", err);
        alert("Error deleting work order: " + err.message);
      }
    }
  };

  return (
    <>
      <Modal open={editModalOpen} onClose={closeEditModal} title="Edit Work Order">
        {editingOrder && (
          <form className="modal-form" onSubmit={async (e) => {
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
              await editWorkOrder(editingOrder.id, data);
              setWorkOrder({ ...workOrder, ...data });
              closeEditModal();
            } catch (err) {
              console.error("Error editing work order:", err);
              alert("Error editing order: " + err.message);
            }
          }}>
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
      <Header icon_url="assets/order.svg" title="Work Order Details" username="John Doe" />
      
      <div className="work-order-page">
        <div className="work-order-header">
          <h2>Work Order #{workOrder.id}</h2>
          <button onClick={() => navigate('/')}>Back to Dashboard</button>
        </div>

        <div className="work-order-content">
          {/* Order Information Section */}
          <section className="work-order-section">
            <h3>Order Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Entry Date:</label>
                <span>{formatDate(workOrder.entry_date)}</span>
              </div>
              <div className="info-item">
                <label>Egress Date:</label>
                <span>{formatDate(workOrder.egress_date)}</span>
              </div>
              <div className="info-item">
                <label>Work Status:</label>
                <span className={`status-badge status-${workOrder.work_status}`}>
                  {formatStatus(workOrder.work_status)}
                </span>
              </div>
              <div className="info-item">
                <label>Payment Status:</label>
                <span className={`status-badge status-${workOrder.payment_status}`}>
                  {formatStatus(workOrder.payment_status)}
                </span>
              </div>
            </div>
          </section>

          {/* Customer Information Section */}
          <section className="work-order-section">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Customer Name:</label>
                <span>{customer?.name || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{customer?.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{customer?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Client ID:</label>
                <span>{workOrder.client_id}</span>
              </div>
            </div>
          </section>

          {/* Vehicle Information Section */}
          <section className="work-order-section">
            <h3>Vehicle Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Vehicle ID:</label>
                <span>{workOrder.vehicle_id}</span>
              </div>
            </div>
          </section>

          {/* Work Details Section */}
          <section className="work-order-section">
            <h3>Work Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Workers:</label>
                <span>{workOrder.workers}</span>
              </div>
              <div className="info-item">
                <label>Hours:</label>
                <span>{workOrder.hours || 'N/A'}</span>
              </div>
              <div className="info-item full-width">
                <label>Details:</label>
                <span>{workOrder.details || 'No details provided'}</span>
              </div>
              <div className="info-item full-width">
                <label>Spare Parts:</label>
                <span>{workOrder.spare_parts || 'None'}</span>
              </div>
            </div>
          </section>

          {/* Technical Information Section */}
          <section className="work-order-section">
            <h3>Technical Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Refrigerant Gas Retrieved:</label>
                <span>{workOrder.refrigerant_gas_retrieved || 0} units</span>
              </div>
              <div className="info-item">
                <label>Refrigerant Gas Injected:</label>
                <span>{workOrder.refrigerant_gas_injected || 0} units</span>
              </div>
              <div className="info-item">
                <label>Oil Retrieved:</label>
                <span>{workOrder.oil_retrieved || 0} units</span>
              </div>
              <div className="info-item">
                <label>Oil Injected:</label>
                <span>{workOrder.oil_injected || 0} units</span>
              </div>
              <div className="info-item">
                <label>Detector Used:</label>
                <span>{workOrder.detector ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="work-order-actions">
          <button onClick={() => navigate('/')}>Back to Dashboard</button>
          <button onClick={openEditModal}>Edit Work Order</button>
          <button onClick={handleDelete}>Delete Work Order</button>
          <button>Print</button>
        </div>
      </div>
    </>
  );
}
