import { useEffect, useState } from "react";
import { queueService } from "../../services/appointmentService";
import { getErrorMessage } from "../../services/api";
import { Loading, Alert } from "../../components/Feedback";

const ReceptionDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    queueService
      .get()
      .then((res) => setQueue(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: queue.length,
    waiting: queue.filter((a) => a.status === "WAITING").length,
    inConsultation: queue.filter((a) => a.status === "IN_CONSULTATION").length,
  };

  return (
    <div>
      <div className="section-header">
        <h1>Reception dashboard</h1>
        <p className="text-muted">Today's activity at a glance.</p>
      </div>

      <Alert message={error} />
      {loading ? (
        <Loading />
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{counts.total}</div>
            <div className="stat-label">Patients today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{counts.waiting}</div>
            <div className="stat-label">Waiting</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{counts.inConsultation}</div>
            <div className="stat-label">In consultation</div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Quick actions</h2>
        <p className="text-muted">
          Use the sidebar to register a new patient, create an appointment, or open the
          reception queue to manage today's visits.
        </p>
      </div>
    </div>
  );
};

export default ReceptionDashboard;
