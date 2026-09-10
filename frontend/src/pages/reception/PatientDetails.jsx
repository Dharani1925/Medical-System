import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientService } from "../../services/patientService";
import { doctorService } from "../../services/userService";
import { appointmentService } from "../../services/appointmentService";
import { getErrorMessage } from "../../services/api";
import { Loading, Alert } from "../../components/Feedback";
import { PatientInfoCard } from "../../components/PatientInfoCard";
import { MedicalHistory } from "../../components/MedicalHistory";
import { Modal } from "../../components/Modal";

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: "", appointmentDate: "", appointmentTime: "", reason: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    patientService
      .getById(id)
      .then((res) => setPatient(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const openModal = () => {
    doctorService.list().then((res) => setDoctors(res.data.data));
    setForm({
      doctorId: "",
      appointmentDate: new Date().toISOString().slice(0, 10),
      appointmentTime: "",
      reason: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.doctorId || !form.appointmentDate || !form.appointmentTime) {
      setFormError("Doctor, date and time are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await appointmentService.create({ ...form, patientId: id });
      setSuccess(res.data.message);
      setShowModal(false);
      setTimeout(() => navigate("/reception/queue"), 700);
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
        <button className="btn btn-primary" onClick={openModal}>+ Create appointment</button>
      </div>

      <Alert type="success" message={success} />
      <PatientInfoCard patient={patient} />
      <div className="mt-16">
        <MedicalHistory patientId={id} />
      </div>

      {showModal && (
        <Modal title="Create appointment" onClose={() => setShowModal(false)}>
          <Alert type="error" message={formError} />
          <form onSubmit={handleCreateAppointment}>
            <div className="form-group">
              <label className="form-label">Doctor *</label>
              <select
                className="form-control"
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.specialization ? `— ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.appointmentDate}
                  onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.appointmentTime}
                  onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for visit</label>
              <input
                className="form-control"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create appointment"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PatientDetails;
