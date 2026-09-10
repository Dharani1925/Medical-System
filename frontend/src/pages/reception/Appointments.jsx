import { useEffect, useState } from "react";
import { appointmentService } from "../../services/appointmentService";
import { doctorService } from "../../services/userService";
import { getErrorMessage } from "../../services/api";
import { Loading, EmptyState, Alert } from "../../components/Feedback";
import { StatusBadge } from "../../components/Badge";

const STATUSES = ["WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED"];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({ date: "", doctorId: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    doctorService.list().then((res) => setDoctors(res.data.data));
  }, []);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.doctorId) params.doctorId = filters.doctorId;
    if (filters.status) params.status = filters.status;

    appointmentService
      .list(params)
      .then((res) => setAppointments(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filters]);

  return (
    <div>
      <div className="section-header">
        <h1>Appointments</h1>
        <p className="text-muted">Filter by date, doctor, or status.</p>
      </div>

      <div className="card mb-16">
        <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Doctor</label>
            <select
              className="form-control"
              value={filters.doctorId}
              onChange={(e) => setFilters({ ...filters, doctorId: e.target.value })}
            >
              <option value="">All doctors</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Alert message={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : appointments.length === 0 ? (
          <EmptyState title="No appointments found" hint="Try adjusting the filters above." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>#{a.tokenNumber}</td>
                    <td>{a.patientId?.name}</td>
                    <td>{a.doctorId?.name}</td>
                    <td>{a.appointmentDate}</td>
                    <td>{a.appointmentTime}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
