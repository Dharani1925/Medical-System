export const PatientInfoCard = ({ patient }) => (
  <div className="card">
    <div className="flex-between mb-16">
      <h2>{patient.name}</h2>
      <span className="badge badge-role">{patient.patientId}</span>
    </div>
    <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
      <div>
        <div className="text-muted" style={{ fontSize: 12 }}>Age / Gender</div>
        <div>{patient.age} / {patient.gender}</div>
      </div>
      <div>
        <div className="text-muted" style={{ fontSize: 12 }}>Phone</div>
        <div>{patient.phone}</div>
      </div>
      <div>
        <div className="text-muted" style={{ fontSize: 12 }}>Email</div>
        <div>{patient.email || "—"}</div>
      </div>
      <div>
        <div className="text-muted" style={{ fontSize: 12 }}>Address</div>
        <div>{patient.address || "—"}</div>
      </div>
    </div>
  </div>
);
