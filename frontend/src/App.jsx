import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        {/* Clients Page */}
        <Route
          path="/clients"
          element={
            <DashboardLayout>
              <Clients />
            </DashboardLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
