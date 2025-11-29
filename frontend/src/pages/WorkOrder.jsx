import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "../components/Header";

// Mock data
import sampleOrders from '../data/sampleOrders.json';
import customers from '../data/sampleCustomers.json';

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
        const order = sampleOrders.find(o => o.id === parseInt(id));
        
        if (!order) {
          setError('Work order not found');
          setLoading(false);
          return;
        }
        
        // Find associated customer
        const cust = customers.find(c => c.id === order.client_id);
        
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

  return (
    <>
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
          <button>Edit Work Order</button>
          <button>Print</button>
        </div>
      </div>
    </>
  );
}
