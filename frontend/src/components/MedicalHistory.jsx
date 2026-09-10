import { useEffect, useState } from "react";
import { consultationService } from "../services/consultationService";
import { getErrorMessage } from "../services/api";
import { Loading, EmptyState, Alert } from "./Feedback";

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Renders every consultation ever recorded for a patient, newest first,
 * regardless of which doctor wrote it. This is the visual proof of the
 * "one patient, many doctors, one continuous history" requirement.
 */
export const MedicalHistory = ({ patientId, refreshKey }) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    consultationService
      .getByPatient(patientId)
      .then((res) => setConsultations(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [patientId, refreshKey]);

  if (loading) return <Loading label="Loading medical history..." />;

  return (
    <div className="card">
      <h2>Medical history</h2>
      <Alert message={error} />
      {consultations.length === 0 ? (
        <EmptyState title="No consultations yet" hint="Consultations will appear here once a doctor completes a visit." />
      ) : (
        consultations.map((c, idx) => (
          <div
            key={c._id}
            style={{
              padding: "14px 0",
              borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
            }}
          >
            <div className="flex-between">
              <strong style={{ color: "var(--color-primary-dark)" }}>
                Dr. {c.doctorId?.name?.replace(/^Dr\.\s*/i, "")}
              </strong>
              <span className="text-muted" style={{ fontSize: 12.5 }}>{formatDate(c.createdAt)}</span>
            </div>
            {c.doctorId?.specialization && (
              <div className="text-muted" style={{ fontSize: 12 }}>{c.doctorId.specialization}</div>
            )}
            <div className="mt-16" style={{ display: "grid", gap: 6 }}>
              <div><strong>Symptoms:</strong> {c.symptoms}</div>
              <div><strong>Diagnosis:</strong> {c.diagnosis}</div>
              {c.prescription && <div><strong>Prescription:</strong> {c.prescription}</div>}
              {c.notes && <div><strong>Notes:</strong> {c.notes}</div>}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
