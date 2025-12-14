import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Layout from "../components/Layout.jsx";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "advisor",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  // 🔹 SIMPLE VALIDATIONS
  const validate = () => {
    if (!form.name.trim()) return (alert("Please enter your full name"), false);

    if (form.name.trim().length < 3)
      return (alert("Name must be at least 3 characters"), false);

    if (!form.email.trim()) return (alert("Please enter email"), false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email))
      return (alert("Enter a valid email address"), false);

    if (!form.password) return (alert("Please enter password"), false);

    if (form.password.length < 6)
      return (alert("Password must be at least 6 characters"), false);

    if (!form.role) return (alert("Please select a role"), false);

    if (!form.phone.trim()) return (alert("Please enter phone number"), false);

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(form.phone))
      return (alert("Phone must be 10–15 digits only"), false);

    if (!form.address.trim()) return (alert("Please enter address"), false);

    if (form.address.trim().length < 5)
      return (alert("Address must be at least 5 characters"), false);

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post("/auth/register", form);
      alert("Registered successfully.\nAwait admin approval.");
      nav("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
        <h3>Sign up (Advisor / Technician / Cashier)</h3>

        <form
          onSubmit={submit}
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            className="input"
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="input"
            placeholder="Password * (min 6 chars)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="advisor">Advisor</option>
            <option value="technician">Technician</option>
            <option value="cashier">Cashier</option>
          </select>

          <input
            className="input"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
            }
          />

          <input
            className="input"
            placeholder="Address *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Signing..." : "Sign Up"}
            </button>

            <button
              className="btn ghost"
              type="button"
              onClick={() => nav("/login")}
              disabled={submitting}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
