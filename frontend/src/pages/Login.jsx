import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import "../styles.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!form.email || !form.password)
      return setError("Enter email and password");
    try {
      setLoading(true);
      const res = await api.post("/auth/login", form);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      // optional: store email
      localStorage.setItem("email", user.email);
      nav("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{ width: 420, padding: 24, borderRadius: 12 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>
            JobCard — Service
          </div>
          <div className="small">Sign in</div>
        </div>

        {error && (
          <div
            className="card small"
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <label
            className="small"
            style={{ marginBottom: 6, display: "block" }}
          >
            Email
          </label>
          <input
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
          />

          <label
            className="small"
            style={{ marginTop: 10, marginBottom: 6, display: "block" }}
          >
            Password
          </label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Link to="/signup" className="link small">
              Create account
            </Link>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
