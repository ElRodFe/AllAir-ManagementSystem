import React, { useEffect, useMemo, useState } from 'react';
import StatCard from "../components/StatCard";
import OrdersTable from "../components/OrdersTable";
import "../styles/pages/Dashboard.css";
import Header from "../components/Header";
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import Pagination from '../components/Paginations';
import useDebounce from '../utils/useDebounce';

// Mock data
import sampleData from '../data/sampleOrders.json';
import customers from '../data/sampleCustomers.json';

function uniqueValues(items, key) {
  return Array.from(new Set(items.map(i => i[key]).filter(Boolean))).sort();
}

export default function Dashboard() {
  const [rawData, setRawData] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [filters, setFilters] = useState({
    payment_status: "",
    work_status: "",
    order: "asc",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Load Order Data
  useEffect(() => {
    async function load() {
      try {
        // Replace with actual data fetching logic
        setRawData(sampleData);
      } catch (e) {
        setRawData(sampleData);
      }
    }
    load();
  }, []);

  // Joined Tables (Mock Data)
  const ordersWithCustomerInfo = useMemo(() => {
    return rawData.map(order => {
      const cust = customers.find(c => c.id === order.client_id);

      return {
        ...order,
        customer_name: cust ? cust.name : "Unknown",
        customer_phone: cust ? cust.phone : "N/A",
        customer_email: cust ? cust.email : "N/A"
      };
    });
  }, [rawData]);

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

  return (
    <>
      <Header icon_url="assets/board.svg" title="Dashboard" username="John Doe" />

      <div className="dashboard">

        <h2 className="font-title margin-bottom-md">Overview</h2>

        <div className="overview-box flex">
          <StatCard icon_url="assets/total_orders.svg" label="Total Orders" value={rawData.length} color="orange" />
          <StatCard icon_url="assets/new_orders.svg" label="New Orders" value={20} color="blue" />
          <StatCard icon_url="assets/completed_orders.svg" label="Completed Orders" value={20} color="green" />
          <StatCard icon_url="assets/pending_orders.svg" label="Pending Orders" value={20} color="red" />
        </div>

        <h2 className="font-title margin-bottom-lg">Activity Feed</h2>

        <div className="app-shell">
          <h3 className='font-subtitle margin-bottom-md'>Latest Pending Orders</h3>

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

          <OrdersTable items={pageItems} />

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
