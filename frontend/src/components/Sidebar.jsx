import { Link } from "react-router-dom";
import "../styles/components/Sidebar.css";

export default function Sidebar() {
  return (
    <aside>
      <div className="sidebar-header center">
        <img src="assets/allair_logo.svg" alt="Logo" />
      </div>
      
      <div className="sidebar-body flex font-subtitle">
        <nav>
          <div className="nav-item margin-bottom-lg">
            <Link className="nav-link" to="/dashboard">
              <img src="assets/board_tumb.svg" alt="Dashboard" />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className="nav-item margin-bottom-lg">
            <Link className="nav-link" to="/clients">
              <img src="assets/client_tumb.svg" alt="Clients" />
              <span>Clients</span>
            </Link>
          </div>
          <div className="nav-item margin-bottom-lg">
            <Link className="nav-link" to="/work-orders">
              <img src="assets/order_tumb.svg" alt="Work Orders" />
            <span>Work Orders</span></Link>
          </div>
        </nav>

        <div className="nav-footer">
          <div className="foot-nav-item">
            <Link className="nav-link" to="/logout">
              <img src="assets/logout.svg" alt="Log Out" />
              <span>Log Out</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
