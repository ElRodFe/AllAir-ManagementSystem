import React, { useEffect, useMemo, useState } from 'react';
import Login from '../components/Login';
import StatCard from "../components/StatCard";
import OrdersTable from "../components/OrdersTable";
import "../styles/pages/Dashboard.css";
import Header from "../components/Header";
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import Pagination from '../components/Paginations';
import useDebounce from '../utils/useDebounce';
import { getWorkOrders, getClients, isAuthenticated, loginUser } from "../utils/api";

function uniqueValues(items, key) {
  return Array.from(new Set(items.map(i => i[key]).filter(Boolean))).sort();
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    payment_status: "",
    work_status: "",
    order: "asc",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Check authentication and load data
  useEffect(() => {
    if (isAuthenticated()) {
      setUser({ loggedIn: true });
      loadData();
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData.user);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersData, clientsData] = await Promise.all([
        getWorkOrders(),
        getClients()
      ]);
      setRawData(ordersData);
      setClients(clientsData);
    } catch (err) {
      setError(err.message);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Show login if not authenticated
  if (!user && !isAuthenticated()) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const ordersWithCustomerInfo = useMemo(() => {
    if (!user) return [];
    
    return rawData.map(order => {
      const cust = clients.find(c => c.id === order.client_id);

      return {
        ...order,
        customer_name: cust ? cust.name : "Unknown",
        customer_phone: cust ? cust.phone_number : "N/A",
        customer_email: cust ? cust.email : "N/A",
      };
    });
  }, [rawData, clients, user]);

  const payment_status = useMemo(() => uniqueValues(rawData, "payment_status"), [rawData]);
  const work_status = useMemo(() => uniqueValues(rawData, "work_status"), [rawData]);

  const filtered = useMemo(() => {
    let items = [...ordersWithCustomerInfo]; 

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      items = items.filter(it =>
        `${it.id}`.toLowerCase().includes(s) ||
        (it.customer_name || '').toLowerCase().includes(s) ||
        (it.details || '').toLowerCase().includes(s) ||
        (it.spare_parts || '').toLowerCase().includes(s)
      );
    }

    if (filters.payment_status)
      items = items.filter(i => i.payment_status === filters.payment_status);

    if (filters.work_status)
      items = items.filter(i => i.work_status === filters.work_status);

    items.sort((a, b) => {
      const dA = new Date(a.entry_date);
      const dB = new Date(b.entry_date);
      return filters.order === "asc" ? dA - dB : dB - dA;
    });

    return items;
  }, [ordersWithCustomerInfo, filters, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => {
    return {
      total: rawData.length,
      new: rawData.filter(order => order.work_status === 'PENDING').length,
      completed: rawData.filter(order => order.work_status === 'COMPLETED').length,
      pending: rawData.filter(order => 
        order.payment_status === 'PENDING' || order.work_status === 'IN_PROGRESS'
      ).length
    };
  }, [rawData]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  return (
    <>
      <Header 
        icon_url="assets/board.svg" 
        title="Dashboard" 
        username={user?.username || "User"} 
      />

      <div className="dashboard">
        {error && (
          <div className="error-banner">
            Error: {error}
            <button onClick={loadData} style={{marginLeft: '10px'}}>
              Retry
            </button>
          </div>
        )}

        <h2 className="font-title margin-bottom-md">Overview</h2>

        <div className="overview-box flex">
          <StatCard 
            icon_url="assets/total_orders.svg" 
            label="Total Orders" 
            value={stats.total} 
            color="orange" 
          />
          <StatCard 
            icon_url="assets/new_orders.svg" 
            label="New Orders" 
            value={stats.new} 
            color="blue" 
          />
          <StatCard 
            icon_url="assets/completed_orders.svg" 
            label="Completed Orders" 
            value={stats.completed} 
            color="green" 
          />
          <StatCard 
            icon_url="assets/pending_orders.svg" 
            label="Pending Orders" 
            value={stats.pending} 
            color="red" 
          />
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