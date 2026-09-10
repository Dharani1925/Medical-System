const STATUS_MAP = {
  WAITING: { label: "Waiting", cls: "badge-waiting" },
  IN_CONSULTATION: { label: "In Consultation", cls: "badge-progress" },
  COMPLETED: { label: "Completed", cls: "badge-done" },
  CANCELLED: { label: "Cancelled", cls: "badge-cancelled" },
};

export const StatusBadge = ({ status }) => {
  const entry = STATUS_MAP[status] || { label: status, cls: "badge-role" };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
};

export const RoleBadge = ({ role }) => <span className="badge badge-role">{role}</span>;
