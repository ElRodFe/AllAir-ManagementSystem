import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

import DetailsLayout from "../components/DetailsLayout";
import DetailsSection from "../components/DetailsSection";
import DetailsInfoItem from "../components/DetailsInfoItem";
import LoadingSpinner from "../components/LoadingSpinner";

import { getWorkOrderById } from "../services/workOrderService";
import { getClientById } from "../services/clientService";

export default function WorkOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workOrder, setWorkOrder] = useState(null);
  const [client, setClient] = useState(null);

  useEffect(() => {
    async function load() {
      const order = await getWorkOrderById(id);
      const cust = await getClientById(order.client_id);

      setWorkOrder(order);
      setClient(cust);
    }
    load();
  }, [id]);

  if (!workOrder) return <LoadingSpinner message="Loading work order details..." fullPage />;

  return (
    <>
      <Header icon_url="/assets/order.svg" title="Work Order Details" />

      <div style={{ 
        margin: '2rem 0', 
        display: 'flex', 
        justifyContent: 'center',
        padding: '0 2rem'
      }}>
        <button 
          className="btn-back" 
          onClick={() => navigate('/work-orders')}
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
          ← Back to Work Orders
        </button>
      </div>

      <DetailsLayout title={`Order #${workOrder.id}`}>
        <DetailsSection title="Information">
          <DetailsInfoItem label="Client ID" value={workOrder.client_id} />
          <DetailsInfoItem label="Vehicle ID" value={workOrder.vehicle_id} />

          <DetailsInfoItem label="Entry Date" value={workOrder.entry_date} />
          <DetailsInfoItem label="Exit" value={workOrder.egress_date || "Still in Workshop"} />

          <DetailsInfoItem label="Workers" value={workOrder.workers} full />
        </DetailsSection>

        <DetailsSection title="Technical">
          <DetailsInfoItem label="Gas Retrieved (gr)" value={workOrder.refrigerant_gas_retrieved} />
          <DetailsInfoItem label="Gas Injected (gr)" value={workOrder.refrigerant_gas_injected} />

          <DetailsInfoItem label="Oil Retrieved (gr)" value={workOrder.oil_retrieved} />
          <DetailsInfoItem label="Oil Injected (gr)" value={workOrder.oil_injected} />

          <DetailsInfoItem label="Leak Detector Used" value={workOrder.detector ? "Yes" : "No"} />
        </DetailsSection>

        <DetailsSection title="Spare Parts">
          <div className="details-info-item full">
            <div className="details-textbox">{workOrder.spare_parts || "None"}</div>
          </div>
        </DetailsSection>

        <DetailsSection title="Details">
          <div className="details-info-item full">
            <div className="details-textbox">{workOrder.details || "No Details"}</div>
          </div>
        </DetailsSection>
      </DetailsLayout>
    </>
  );
}
