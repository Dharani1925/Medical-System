import { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import { patientService } from "../../services/patientService";
import { appointmentService } from "../../services/appointmentService";
import { getErrorMessage } from "../../services/api";
import { Loading, Alert } from "../../components/Feedback";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      userService.list("DOCTOR"),
      userService.list("RECEPTIONIST"),
      patientService.list(),
      appointmentService.list({ date: today }),
    ])
      .then(([doctors, receptionists, patients, todaysAppointments]) => {
        setStats({
          doctors: doctors.data.data.length,
          receptionists: receptionists.data.data.length,
          patients: patients.data.data.length,
          todaysAppointments: todaysAppointments.data.data.length,
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="section-header">
        <h1>Clinic overview</h1>
        <p className="text-muted">A snapshot of staff, patients, and today's activity.</p>
      </div>

      <Alert message={error} />
      {loading ? (
        <Loading />
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.patients}</div>
            <div className="stat-label">Total patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.doctors}</div>
            <div className="stat-label">Doctors</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.receptionists}</div>
            <div className="stat-label">Receptionists</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.todaysAppointments}</div>
            <div className="stat-label">Today's appointments</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
