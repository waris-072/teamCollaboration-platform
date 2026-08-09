import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import useAuth from "../../hooks/useAuth";

import "./dashboard-styling/DashboardLayout.css";

function DashboardLayout() {
  const { user } = useAuth();

  const roleClass = user?.role
    ? `dashboard-${user.role}`
    : "";

  return (
    <div className={`dashboard-layout ${roleClass}`}>
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;