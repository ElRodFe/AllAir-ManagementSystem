import Sidebar from "../components/Sidebar";
import "../styles/layouts/DashboardLayout.css";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-grid">
      <Sidebar className="sidebar"/>
      <main>
        {children}
      </main>
    </div>
  );
}