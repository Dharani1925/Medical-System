import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { patientService } from "../../services/patientService";
import { consultationService } from "../../services/consultationService";
import { getErrorMessage } from "../../services/api";
import { Loading, Alert } from "../../components/Feedback";
import { PatientInfoCard } from "../../components/PatientInfoCard";
import { MedicalHistory } from "../../components/MedicalHistory";

const EMPTY_FORM = { symptoms: "", diagnosis: "", prescription: "", notes: "" };

const DoctorPatientDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [historyKey, setHistoryKey] = useState(0); // bump to refresh MedicalHistory after saving

  useEffect(() => {
    patientService
      .getById(id)
      .then((res) => setPatient(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!appointmentId) {
      setFormError("No appointment selected. Open this patient from Today's Patients to add a consultation.");
      return;
    }
    if (!form.symptoms.trim() || !form.diagnosis.trim()) {
      setFormError("Symptoms and diagnosis are required.");
      return;
    }

    setSubmitting(true);
    try {
      await consultationService.create({ ...form, patientId: id, appointmentId });
      setSuccess("Consultation saved and added to the patient's medical history.");
      setForm(EMPTY_FORM);
      setHistoryKey((k) => k + 1); // refresh the history list below
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Alert message={error} />;
  if (!patient) return null;

  return (
    <div>
      <div className="flex-between section-header">
        <h1>Patient profile</h1>
        <button className="btn btn-secondary" onClick={() => navigate("/doctor/patients")}>
          Back to today's patients
        </button>
      </div>

      <PatientInfoCard patient={patient} />

      <div className="mt-16" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div>
          <MedicalHistory patientId={id} refreshKey={historyKey} />
        </div>

        <div className="card">
          <h2>Add consultation</h2>
          {!appointmentId && (
            <p className="text-muted">
              This patient was opened without an active appointment, so consultations can't be saved here.
              Open them from "Today's Patients" instead.
            </p>
          )}
          <Alert type="error" message={formError} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Symptoms *</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                disabled={!appointmentId}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Diagnosis *</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                disabled={!appointmentId}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prescription</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.prescription}
                onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                disabled={!appointmentId}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Doctor notes</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                disabled={!appointmentId}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting || !appointmentId}>
              {submitting ? "Saving..." : "Save consultation & complete visit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDetails;
