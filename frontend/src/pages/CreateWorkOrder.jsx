import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";

// Mock data
import customers from '../data/sampleCustomers.json';

export default function CreateWorkOrder() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    egress_date: '',
    client_id: '',
    vehicle_id: '',
    work_status: 'pending',
    payment_status: 'not_paid',
    refrigerant_gas_retrieved: '',
    refrigerant_gas_injected: '',
    oil_retrieved: '',
    oil_injected: '',
    detector: false,
    spare_parts: '',
    details: '',
    workers: '',
    hours: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.entry_date) {
      newErrors.entry_date = 'Entry date is required';
    }

    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }

    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 'Vehicle ID is required';
    }

    if (!formData.workers) {
      newErrors.workers = 'Workers field is required';
    }

    if (formData.egress_date && formData.entry_date) {
      if (new Date(formData.egress_date) < new Date(formData.entry_date)) {
        newErrors.egress_date = 'Egress date cannot be before entry date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Here you would normally send the data to your API
    console.log('Form submitted:', formData);
    
    // For now, just navigate back to work orders list
    alert('Work order created successfully!');
    navigate('/work-orders');
  };

  const handleCancel = () => {
    navigate('/work-orders');
  };

  return (
    <>
      <Header icon_url="assets/order.svg" title="Create Work Order" username="John Doe" />
      
      <div className="create-work-order-page">
        <div className="page-header">
          <h2>Create New Work Order</h2>
        </div>

        <form onSubmit={handleSubmit} className="work-order-form">
          {/* Order Information Section */}
          <section className="form-section">
            <h3>Order Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="entry_date">Entry Date *</label>
                <input
                  type="date"
                  id="entry_date"
                  name="entry_date"
                  value={formData.entry_date}
                  onChange={handleChange}
                  required
                />
                {errors.entry_date && <span className="error">{errors.entry_date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="egress_date">Egress Date</label>
                <input
                  type="date"
                  id="egress_date"
                  name="egress_date"
                  value={formData.egress_date}
                  onChange={handleChange}
                />
                {errors.egress_date && <span className="error">{errors.egress_date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="work_status">Work Status *</label>
                <select
                  id="work_status"
                  name="work_status"
                  value={formData.work_status}
                  onChange={handleChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="payment_status">Payment Status *</label>
                <select
                  id="payment_status"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  required
                >
                  <option value="not_paid">Not Paid</option>
                  <option value="not_requested">Not Requested</option>
                  <option value="bill_sent">Bill Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </section>

          {/* Client and Vehicle Information */}
          <section className="form-section">
            <h3>Client & Vehicle Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="client_id">Client *</label>
                <select
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a client</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
                {errors.client_id && <span className="error">{errors.client_id}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="vehicle_id">Vehicle ID *</label>
                <input
                  type="number"
                  id="vehicle_id"
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  min="1"
                  required
                />
                {errors.vehicle_id && <span className="error">{errors.vehicle_id}</span>}
              </div>
            </div>
          </section>

          {/* Work Details */}
          <section className="form-section">
            <h3>Work Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="workers">Workers *</label>
                <input
                  type="text"
                  id="workers"
                  name="workers"
                  value={formData.workers}
                  onChange={handleChange}
                  maxLength="50"
                  required
                />
                {errors.workers && <span className="error">{errors.workers}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="hours">Hours</label>
                <input
                  type="number"
                  id="hours"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="details">Details</label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  maxLength="1000"
                  rows="4"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="spare_parts">Spare Parts</label>
                <textarea
                  id="spare_parts"
                  name="spare_parts"
                  value={formData.spare_parts}
                  onChange={handleChange}
                  maxLength="500"
                  rows="3"
                />
              </div>
            </div>
          </section>

          {/* Technical Information */}
          <section className="form-section">
            <h3>Technical Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="refrigerant_gas_retrieved">Refrigerant Gas Retrieved</label>
                <input
                  type="number"
                  id="refrigerant_gas_retrieved"
                  name="refrigerant_gas_retrieved"
                  value={formData.refrigerant_gas_retrieved}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="refrigerant_gas_injected">Refrigerant Gas Injected</label>
                <input
                  type="number"
                  id="refrigerant_gas_injected"
                  name="refrigerant_gas_injected"
                  value={formData.refrigerant_gas_injected}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="oil_retrieved">Oil Retrieved</label>
                <input
                  type="number"
                  id="oil_retrieved"
                  name="oil_retrieved"
                  value={formData.oil_retrieved}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="oil_injected">Oil Injected</label>
                <input
                  type="number"
                  id="oil_injected"
                  name="oil_injected"
                  value={formData.oil_injected}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="detector"
                    checked={formData.detector}
                    onChange={handleChange}
                  />
                  <span>Detector Used</span>
                </label>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Work Order
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
