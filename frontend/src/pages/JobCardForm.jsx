import React, { useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";

export default function JobCardForm() {
  const [form, setForm] = useState({
    vehicleType: "2W",
    vehicleNumber: "",
    customerName: "",
    customerPhone: "",
    reportedIssue: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const nav = useNavigate();
  const indianVehicleRegex =
    /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,2}[ -]?[0-9]{4}$/;

  const validate = () => {
    if (!form.vehicleType) return (alert("Please select vehicle type"), false);

    if (!form.vehicleNumber.trim())
      return (alert("Vehicle number is required"), false);

    const vehicleNo = form.vehicleNumber.trim().toUpperCase();

    if (!indianVehicleRegex.test(vehicleNo))
      return (
        alert(
          "Invalid Indian vehicle number.\nExample: TN09AB1234 or KA-01-MH-9999",
        ),
        false
      );

    if (form.vehicleNumber.trim().length < 5)
      return (alert("Enter a valid vehicle number"), false);

    if (!form.customerName.trim())
      return (alert("Customer name is required"), false);

    if (form.customerName.trim().length < 3)
      return (alert("Customer name must be at least 3 characters"), false);

    if (!form.customerPhone.trim())
      return (alert("Customer phone number is required"), false);

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(form.customerPhone))
      return (alert("Customer phone must be 10–15 digits"), false);

    if (!form.reportedIssue.trim())
      return (alert("Reported issue is required"), false);

    if (form.reportedIssue.trim().length < 5)
      return (alert("Reported issue must be at least 5 characters"), false);

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post("/jobcards", form);
      alert("Job card created successfully");
      nav("/jobcards");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create job card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="card">
        <h3>Create Job Card</h3>

        <form onSubmit={submit} style={{ marginTop: 10 }}>
          <div className="form-row">
            <select
              className="input"
              value={form.vehicleType}
              onChange={(e) =>
                setForm({ ...form, vehicleType: e.target.value })
              }
            >
              <option value="2W">2 Wheeler</option>
              <option value="4W">4 Wheeler</option>
            </select>

            <input
              className="input"
              placeholder="Vehicle Number (TN09AB1234)"
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  vehicleNumber: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          <div className="form-row">
            <input
              className="input"
              placeholder="Customer Name *"
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
            />

            <input
              className="input"
              placeholder="Customer Phone *"
              value={form.customerPhone}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerPhone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <textarea
              className="input"
              placeholder="Reported Issue *"
              value={form.reportedIssue}
              onChange={(e) =>
                setForm({ ...form, reportedIssue: e.target.value })
              }
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </button>

            <button
              className="btn ghost"
              type="button"
              onClick={() => nav("/jobcards")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
