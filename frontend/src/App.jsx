import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Doctors from "./pages/admin/Doctors";
import Receptionists from "./pages/admin/Receptionists";
import Users from "./pages/admin/Users";

import ReceptionDashboard from "./pages/reception/ReceptionDashboard";
import PatientList from "./pages/reception/PatientList";
import RegisterPatient from "./pages/reception/RegisterPatient";
import PatientDetails from "./pages/reception/PatientDetails";
import Appointments from "./pages/reception/Appointments";
import ReceptionQueue from "./pages/reception/ReceptionQueue";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import TodayPatients from "./pages/doctor/TodayPatients";
import DoctorPatientDetails from "./pages/doctor/PatientDetails";

function App() {
  const { user, homeRouteFor, initializing } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !initializing && user ? <Navigate to={homeRouteFor(user.role)} replace /> : <Login />
        }
      />

      {/* ---- Admin ---- */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<Doctors />} />
          <Route path="/admin/receptionists" element={<Receptionists />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>
      </Route>

      {/* ---- Receptionist ---- */}
      <Route element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
          <Route path="/reception/patients" element={<PatientList />} />
          <Route path="/reception/register-patient" element={<RegisterPatient />} />
          <Route path="/reception/patients/:id" element={<PatientDetails />} />
          <Route path="/reception/appointments" element={<Appointments />} />
          <Route path="/reception/queue" element={<ReceptionQueue />} />
        </Route>
      </Route>

      {/* ---- Doctor ---- */}
      <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<TodayPatients />} />
          <Route path="/doctor/patients/:id" element={<DoctorPatientDetails />} />
        </Route>
      </Route>

      {/* ---- Fallback ---- */}
      <Route
        path="*"
        element={
          initializing ? null : user ? (
            <Navigate to={homeRouteFor(user.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
