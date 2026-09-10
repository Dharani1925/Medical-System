import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentService } from "../../services/appointmentService";
import { getErrorMessage } from "../../services/api";
import { Loading, EmptyState, Alert } from "../../components/Feedback";
import { StatusBadge } from "../../components/Badge";

const TodayPatients = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    appointmentService
      .list({ date: today })
      .then((res) => setAppointments(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="section-header">
        <h1>Today's patients</h1>
        <p className="text-muted">Patients assigned to you today. Open a patient to view their history and add a consultation.</p>
      </div>

      <Alert message={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : appointments.length === 0 ? (
          <EmptyState title="No patients assigned to you today" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>#{a.tokenNumber}</td>
                    <td>{a.patientId?.name} <span className="text-muted">({a.patientId?.patientId})</span></td>
                    <td>{a.appointmentTime}</td>
                    <td>{a.reason || "—"}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/doctor/patients/${a.patientId?._id}?appointmentId=${a._id}`)}
                      >
                        Open
                      </button>
                    </td>
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

export default TodayPatients;
