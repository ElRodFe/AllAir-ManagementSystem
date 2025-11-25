import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginLayout from "./layouts/LoginLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import WorkOrders from "./pages/WorkOrders";
import WorkOrder from "./pages/WorkOrder";
import CreateWorkOrder from "./pages/CreateWorkOrder";
import Error401 from "./pages/Error401";
import Error500 from "./pages/Error500";
import Clients from "./pages/Clients";
import ClientProfile from "./pages/ClientProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route 
        path="/" 
        element={
          <LoginLayout>
            <Login />
          </LoginLayout>
          } 
        />

        <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
        />
        
        <Route
          path="/work-orders"
          element={
            <DashboardLayout>
              <WorkOrders />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/work-orders/create"
          element={
            <DashboardLayout>
              <CreateWorkOrder />
            </DashboardLayout>
          }
        />
        
        <Route
          path="/work-order/:id"
          element={
            <DashboardLayout>
              <WorkOrder />
            </DashboardLayout>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardLayout>
                <Clients />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Client Profile */}
        <Route
          path="/clients/:id"
          element={
            <DashboardLayout>
              <ClientProfile />
            </DashboardLayout>
          }
        />
        
        {/* Error Pages - Standalone (no layout) */}
        <Route path="/error/401" element={<Error401 />} />
        <Route path="/error/500" element={<Error500 />} />

      </Routes>
    </BrowserRouter>
  );
}
