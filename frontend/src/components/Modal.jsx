export const Modal = ({ title, onClose, children }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <div className="flex-between mb-16">
        <h2>{title}</h2>
        <button className="btn btn-secondary btn-sm" onClick={onClose} type="button">
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);
