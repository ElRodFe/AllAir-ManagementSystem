import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/components/Sidebar.css";
import { logout } from "../services/authService";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside>
      <div className="sidebar-header center">
        <img src="/assets/allair_logo.svg" alt="Logo" />
      </div>

      <div className="sidebar-body flex font-subtitle">
        <nav>
          <div className={`nav-item margin-bottom-lg ${isActive("/dashboard") ? "active" : ""}`}>
            <Link className="nav-link" to="/dashboard">
              <img src="/assets/board_tumb.svg" alt="Dashboard" />
              <span>Dashboard</span>
            </Link>
          </div>

          <div className={`nav-item margin-bottom-lg ${isActive("/clients") ? "active" : ""}`}>
            <Link className="nav-link" to="/clients">
              <img src="/assets/client_tumb.svg" alt="Clients" />
              <span>Clients</span>
            </Link>
          </div>

          <div className={`nav-item margin-bottom-lg ${isActive("/work-orders") ? "active" : ""}`}>
            <Link className="nav-link" to="/work-orders">
              <img src="/assets/order_tumb.svg" alt="Work Orders" />
              <span>Work Orders</span>
            </Link>
          </div>
        </nav>

        <div className="nav-footer">
          <button className="nav-link logout-button" onClick={handleLogout}>
            <img src="/assets/logout.svg" alt="Logout icon" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
