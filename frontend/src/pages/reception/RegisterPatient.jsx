import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientService } from "../../services/patientService";
import { getErrorMessage } from "../../services/api";
import { Alert } from "../../components/Feedback";

const EMPTY_FORM = { name: "", age: "", gender: "MALE", phone: "", email: "", address: "", emergencyContact: "" };

const RegisterPatient = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.age || !form.phone.trim()) {
      setError("Name, age and phone are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await patientService.create({ ...form, age: Number(form.age) });
      setSuccess(`Patient registered — ID ${res.data.data.patientId}`);
      setTimeout(() => navigate(`/reception/patients/${res.data.data._id}`), 900);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h1>Register patient</h1>
        <p className="text-muted">Create a new patient profile. A patient ID is generated automatically.</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name *</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input className="form-control" name="age" type="number" min="0" max="130" value={form.age} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-control" name="address" value={form.address} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency contact</label>
            <input className="form-control" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Register patient"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
