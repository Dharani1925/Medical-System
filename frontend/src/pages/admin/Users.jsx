import { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../services/api";
import { Loading, EmptyState, Alert } from "../../components/Feedback";
import { RoleBadge } from "../../components/Badge";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    userService
      .list(roleFilter || undefined)
      .then((res) => setUsers(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  return (
    <div>
      <div className="flex-between section-header">
        <div>
          <h1>All users</h1>
          <p className="text-muted">Every staff account in the system.</p>
        </div>
        <select className="form-control" style={{ width: 200 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="DOCTOR">Doctor</option>
          <option value="RECEPTIONIST">Receptionist</option>
        </select>
      </div>

      <Alert message={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-done" : "badge-cancelled"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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

export default Users;
