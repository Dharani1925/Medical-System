export const Loading = ({ label = "Loading..." }) => (
  <div className="loading-state">{label}</div>
);

export const EmptyState = ({ title = "Nothing here yet", hint }) => (
  <div className="empty-state">
    <h3>{title}</h3>
    {hint && <p>{hint}</p>}
  </div>
);

export const Alert = ({ type = "error", message }) => {
  if (!message) return null;
  return <div className={`alert alert-${type}`}>{message}</div>;
};
