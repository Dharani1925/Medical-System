import { useEffect, useState } from "react";
import { doctorService } from "../../services/userService";
import { getErrorMessage } from "../../services/api";
import { Loading, EmptyState, Alert } from "../../components/Feedback";
import { Modal } from "../../components/Modal";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", specialization: "" };

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    doctorService
      .list()
      .then((res) => setDoctors(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggleActive = async (doctor) => {
    try {
      await doctorService.update(doctor._id, { isActive: !doctor.isActive });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError("Name, email and password are required.");
      return;
    }
    setSubmitting(true);
    try {
      await doctorService.create(form);
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex-between section-header">
        <div>
          <h1>Doctors</h1>
          <p className="text-muted">Manage doctor accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormError(""); setShowModal(true); }}>
          + Add doctor
        </button>
      </div>

      <Alert message={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : doctors.length === 0 ? (
          <EmptyState title="No doctors yet" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d._id}>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.specialization || "—"}</td>
                    <td>{d.phone || "—"}</td>
                    <td>
                      <span className={`badge ${d.isActive ? "badge-done" : "badge-cancelled"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggleActive(d)}>
                        {d.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Add doctor" onClose={() => setShowModal(false)}>
          <Alert type="error" message={formError} />
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Full name *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Temporary password *</label>
              <input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input className="form-control" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create doctor account"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Doctors;
