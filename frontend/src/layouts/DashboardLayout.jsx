import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/doctors", label: "Doctors" },
    { to: "/admin/receptionists", label: "Receptionists" },
    { to: "/admin/users", label: "All Users" },
  ],
  RECEPTIONIST: [
    { to: "/reception/dashboard", label: "Dashboard" },
    { to: "/reception/patients", label: "Patients" },
    { to: "/reception/register-patient", label: "Register Patient" },
    { to: "/reception/appointments", label: "Appointments" },
    { to: "/reception/queue", label: "Reception Queue" },
  ],
  DOCTOR: [
    { to: "/doctor/dashboard", label: "Dashboard" },
    { to: "/doctor/patients", label: "Today's Patients" },
  ],
};

const PAGE_TITLES = {
  ADMIN: "Admin",
  RECEPTIONIST: "Reception",
  DOCTOR: "Doctor",
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV_BY_ROLE[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          MedTrack
          <span>Clinic Management</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user.name}</strong>
            {user.role}
          </div>
          <button className="btn btn-secondary btn-sm btn-block" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main-col">
      <header className="topbar">
  <div className="topbar-title">
    {PAGE_TITLES[user.role]} workspace
  </div>

  <div className="topbar-profile">
    <div className="profile-icon">
      {user.email.charAt(0).toUpperCase()}
    </div>

    <div className="profile-email">
      {user.email}
    </div>
  </div>
</header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
