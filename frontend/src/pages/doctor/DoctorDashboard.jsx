import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { appointmentService } from "../../services/appointmentService";
import { getErrorMessage } from "../../services/api";
import { Loading, Alert } from "../../components/Feedback";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    appointmentService
      .list({ date: today })
      .then((res) => setAppointments(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const waiting = appointments.filter((a) => a.status === "WAITING").length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div>
      <div className="section-header">
        <h1>Welcome, {user.name}</h1>
        <p className="text-muted">{user.specialization || "General Medicine"}</p>
      </div>

      <Alert message={error} />
      {loading ? (
        <Loading />
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">Today's appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{waiting}</div>
            <div className="stat-label">Waiting</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completed}</div>
            <div className="stat-label">Completed consultations</div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Today's patients</h2>
        <p className="text-muted">Open "Today's Patients" from the sidebar to view your assigned patients and their history.</p>
      </div>
    </div>
  );
};

export default DoctorDashboard;
