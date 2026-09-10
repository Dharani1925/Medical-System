import { useEffect, useState } from "react";
import { receptionistService } from "../../services/userService";
import { getErrorMessage } from "../../services/api";
import { Loading, EmptyState, Alert } from "../../components/Feedback";
import { Modal } from "../../components/Modal";

const EMPTY_FORM = { name: "", email: "", password: "", phone: "" };

const Receptionists = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    receptionistService
      .list()
      .then((res) => setList(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggleActive = async (person) => {
    try {
      await receptionistService.update(person._id, { isActive: !person.isActive });
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
      await receptionistService.create(form);
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
          <h1>Receptionists</h1>
          <p className="text-muted">Manage receptionist accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormError(""); setShowModal(true); }}>
          + Add receptionist
        </button>
      </div>

      <Alert message={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : list.length === 0 ? (
          <EmptyState title="No receptionists yet" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || "—"}</td>
                    <td>
                      <span className={`badge ${r.isActive ? "badge-done" : "badge-cancelled"}`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggleActive(r)}>
                        {r.isActive ? "Deactivate" : "Activate"}
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
        <Modal title="Add receptionist" onClose={() => setShowModal(false)}>
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
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create receptionist account"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Receptionists;
