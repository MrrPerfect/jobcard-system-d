import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import Layout from "../components/Layout.jsx";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    load();
    loadPending();
  }, []);

  const load = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      alert("Failed to load users");
    }
  };

  const loadPending = async () => {
    try {
      const res = await api.get("/admin/users/pending");
      setPending(res.data || []);
    } catch (err) {
      console.warn("Failed to load pending users");
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  const approveUser = async (id) => {
    if (!confirm("Approve this user?")) return;
    try {
      await api.patch(`/admin/users/${id}/approve`);
      alert("User approved");
      loadPending();
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Approve failed");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user? This action is permanent.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      alert("User deleted");
      load();
      loadPending();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const roles = ["", "advisor", "technician", "manager", "cashier"];
  const visibleUsers = roleFilter
    ? users.filter((u) => u.role === roleFilter)
    : users;

  return (
    <Layout>
      <div className="card" style={{ marginBottom: 12 }}>
        <h3>Admin - Pending Registrations</h3>
        {pending.length === 0 ? (
          <div className="small">No pending signups</div>
        ) : (
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="small">{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button className="btn" onClick={() => approveUser(u._id)}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>All Users</h3>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div className="small">Filter by role:</div>
          <select
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === "" ? "All" : r}
              </option>
            ))}
          </select>
        </div>

        <table className="table" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td className="small">{u.email}</td>
                <td>
                  {u.role}
                  {!u.approved && (
                    <span className="small" style={{ marginLeft: 8 }}>
                      {" "}
                      (unapproved)
                    </span>
                  )}
                </td>
                <td>
                  <button
                    className="btn"
                    onClick={() => nav(`/workers/${u._id}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => deleteUser(u._id)}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    style={{ marginLeft: 8 }}
                  >
                    <option value="advisor">advisor</option>
                    <option value="technician">technician</option>
                    <option value="manager">manager</option>
                    <option value="cashier">cashier</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
