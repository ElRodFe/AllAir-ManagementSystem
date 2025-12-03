import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

import DetailsLayout from "../components/DetailsLayout";
import DetailsSection from "../components/DetailsSection";
import DetailsInfoItem from "../components/DetailsInfoItem";

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

  if (!workOrder) return <p>Loading...</p>;

  return (
    <>
      <Header icon_url="/assets/order.svg" title="Work Order Details" />

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
