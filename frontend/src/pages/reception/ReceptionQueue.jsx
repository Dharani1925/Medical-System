import { useEffect, useState } from "react";
import { queueService } from "../../services/appointmentService";
import { getErrorMessage } from "../../services/api";
import { Loading, EmptyState, Alert } from "../../components/Feedback";
import { StatusBadge } from "../../components/Badge";

const NEXT_STATUS = {
  WAITING: "IN_CONSULTATION",
  IN_CONSULTATION: "COMPLETED",
};
const NEXT_LABEL = {
  WAITING: "Start consultation",
  IN_CONSULTATION: "Mark completed",
};

const ReceptionQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoading(true);
    queueService
      .get()
      .then((res) => setQueue(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await queueService.updateStatus(id, status);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex-between section-header">
        <div>
          <h1>Reception queue</h1>
          <p className="text-muted">Today's waiting and in-progress patients, ordered by token.</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>

      <Alert message={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : queue.length === 0 ? (
          <EmptyState title="Queue is empty" hint="Create an appointment to add a patient to today's queue." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {queue.map((a) => (
                  <tr key={a._id}>
                    <td>#{a.tokenNumber}</td>
                    <td>{a.patientId?.name} <span className="text-muted">({a.patientId?.patientId})</span></td>
                    <td>{a.doctorId?.name}</td>
                    <td>{a.appointmentTime}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      {NEXT_STATUS[a.status] ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={updatingId === a._id}
                          onClick={() => handleStatusChange(a._id, NEXT_STATUS[a.status])}
                        >
                          {NEXT_LABEL[a.status]}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      {a.status === "WAITING" && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={updatingId === a._id}
                          onClick={() => handleStatusChange(a._id, "CANCELLED")}
                        >
                          Cancel
                        </button>
                      )}
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

export default ReceptionQueue;
