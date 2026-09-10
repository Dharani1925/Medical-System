import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientService } from "../../services/patientService";
import { getErrorMessage } from "../../services/api";
import { Loading, EmptyState, Alert } from "../../components/Feedback";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadAll = () => {
    setLoading(true);
    patientService
      .list()
      .then((res) => setPatients(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return loadAll();
    setLoading(true);
    try {
      const res = await patientService.search(query.trim());
      setPatients(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex-between section-header">
        <div>
          <h1>Patients</h1>
          <p className="text-muted">Search by name, phone, or patient ID.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/reception/register-patient")}>
          + Register patient
        </button>
      </div>

      <form className="flex gap-8 mb-16" onSubmit={handleSearch}>
        <input
          className="form-control"
          placeholder="Search patients..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-secondary" type="submit">Search</button>
        {query && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setQuery("");
              loadAll();
            }}
          >
            Clear
          </button>
        )}
      </form>

      <Alert message={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : patients.length === 0 ? (
          <EmptyState title="No patients found" hint="Try a different search, or register a new patient." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>{p.patientId}</td>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                    <td>{p.phone}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/reception/patients/${p._id}`)}
                      >
                        View
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

export default PatientList;
