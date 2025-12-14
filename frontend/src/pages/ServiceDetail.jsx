import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Layout from "../components/Layout.jsx";

export default function ServiceDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [job, setJob] = useState(null);
  const [partsResults, setPartsResults] = useState([]);
  const [searchPart, setSearchPart] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [serviceRows, setServiceRows] = useState([]); // {description, amount}
  const [editingAllowed, setEditingAllowed] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const r = await api.get(`/jobcards/${id}`);
      setJob(r.data);
      setSummary(r.data.finalSummary || "");
      setServiceRows(r.data.serviceCharges || []);
      setEditingAllowed((r.data.status || "") !== "Done");
    } catch (e) {
      console.warn(e);
      alert("Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const searchParts = async (q) => {
    setSearchPart(q);
    if (!q || q.trim().length < 2) {
      setPartsResults([]);
      return;
    }
    try {
      const r = await api.get(`/inventory/search?q=${encodeURIComponent(q)}`);
      setPartsResults(r.data || []);
    } catch (e) {
      console.warn(e);
      setPartsResults([]);
    }
  };

  const addPart = async (part) => {
    if (!editingAllowed) return alert("Job is completed; editing disabled");
    const qtyStr = prompt(
      `Enter quantity for ${part.name} (stock: ${part.stock})`,
      "1",
    );
    const qty = Number(qtyStr || 0);
    if (!qty || qty <= 0) return;
    if (qty > (part.stock || 0)) {
      if (
        !confirm(
          `Requested qty ${qty} exceeds available stock ${part.stock}. Continue?`,
        )
      )
        return;
    }
    const reason = prompt("Reason for replacement / usage (optional)", "");
    try {
      const payload = {
        partId: part.id,
        name: part.name,
        qty,
        reason,
        priceAtUse: part.price,
      };
      const r = await api.patch(`/jobcards/${id}/parts`, payload);
      setJob(r.data);
      setPartsResults([]);
      setSearchPart("");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to add part");
    }
  };

  const removePart = async (index) => {
    if (!editingAllowed) return alert("Job is completed; editing disabled");
    if (!confirm("Remove this part from job?")) return;
    try {
      const updated = (job.partsUsed || []).filter((_, i) => i !== index);
      const r = await api.patch(`/jobcards/${id}`, { partsUsed: updated });
      setJob(r.data);
    } catch (e) {
      alert(e?.response?.data?.message || "Remove failed");
    }
  };

  const addServiceRow = () => {
    if (!editingAllowed) return alert("Job is completed; editing disabled");
    setServiceRows((s) => [...s, { description: "", amount: 0 }]);
  };

  const updateService = (idx, key, val) => {
    setServiceRows((s) =>
      s.map((r, i) =>
        i === idx
          ? { ...r, [key]: key === "amount" ? Number(val || 0) : val }
          : r,
      ),
    );
  };

  const removeService = (idx) => {
    if (!editingAllowed) return alert("Job is completed; editing disabled");
    setServiceRows((s) => s.filter((_, i) => i !== idx));
  };

  const saveServices = async () => {
    try {
      await api.patch(`/jobcards/${id}/service-charges`, {
        charges: serviceRows,
      });

      const r = await api.get(`/jobcards/${id}`);
      setJob(r.data);
      alert("Services saved");
    } catch (e) {
      alert(e?.response?.data?.message || "Save failed");
    }
  };

  const completeJob = async () => {
    if (!summary || !summary.trim())
      return alert("Enter completion summary before completing");
    if (!confirm("Mark job as DONE? This will lock edits.")) return;
    try {
      await api.patch(`/jobcards/${id}/service-charges`, {
        charges: serviceRows,
      });
      await api.patch(`/jobcards/${id}`, { finalSummary: summary });
      await api.patch(`/jobcards/${id}/status`, { status: "Done" });
      await load();
      alert("Job completed");
    } catch (e) {
      alert(e?.response?.data?.message || "Complete failed");
    }
  };

  const markCritical = async () => {
    if (!editingAllowed) return alert("Job is completed; editing disabled");
    const note = prompt(
      "Enter critical issue description (optional) for the Service Advisor",
      "",
    );

    try {
      // Step 1: Mark job as critical
      const r = await api.patch(`/jobcards/${id}/critical`, { note });
      setJob(r.data);

      // Step 2: Notify advisor
      await api.post(`/jobcards/${id}/notify-advisor`);

      alert("Job marked as critical and Service Advisor notified.");
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          "Failed to mark critical / notify advisor",
      );
    }
  };

  const assignedToInProgress = async (status) => {
    if (!editingAllowed && status !== "Done")
      return alert("Cannot change status after completion");
    try {
      await api.patch(`/jobcards/${id}/status`, { status });
      await load();
    } catch (e) {
      alert("Status update failed");
    }
  };

  const partsTotal = (job?.partsUsed || []).reduce(
    (s, p) => s + Number(p.qty || 0) * Number(p.priceAtUse || 0),
    0,
  );
  const servicesTotal = (serviceRows || []).reduce(
    (s, r) => s + Number(r.amount || 0),
    0,
  );

  if (loading)
    return (
      <Layout>
        <div className="card small">Loading…</div>
      </Layout>
    );
  if (!job)
    return (
      <Layout>
        <div className="card small">Job not found</div>
      </Layout>
    );

  return (
    <Layout>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}
      >
        {/* LEFT SIDE */}
        <div className="card">
          <h3>
            {job.vehicleNumber} — {job.customerName}
          </h3>
          <div className="small">
            Status: <b>{job.status}</b>
          </div>

          {/* SUMMARY */}
          <h4 style={{ marginTop: 12 }}>Work Summary</h4>
          <textarea
            className="input"
            placeholder="Critical issues, WIP updates, completion notes, next service actions, prevention tips"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={!editingAllowed}
            style={{ minHeight: 140 }}
          />

          <div style={{ marginTop: 12 }}>
            <button
              className="btn btn-danger"
              onClick={markCritical}
              disabled={!editingAllowed || job.critical}
            >
              {job.critical ? "Critical Issue Marked" : "Mark Critical Issue"}
            </button>

            {job.critical && job.criticalNote && (
              <div style={{ marginTop: 8, color: "red" }}>
                <b>Critical Note:</b> {job.criticalNote}
              </div>
            )}
          </div>

          {/* PART SEARCH */}
          <h4 style={{ marginTop: 16 }}>Search Spare Parts</h4>
          <input
            className="input"
            placeholder="Search spare parts"
            value={searchPart}
            onChange={(e) => searchParts(e.target.value)}
            disabled={!editingAllowed}
          />

          {partsResults.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 8,
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <b>{p.name}</b>
                <div className="small">ID: {p.id}</div>
                <div className="small">
                  Stock: {p.stock} | Rs.{p.price}
                </div>
              </div>
              <button
                className="btn small"
                onClick={() => addPart(p)}
                disabled={!editingAllowed}
              >
                Add
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="card">
          {/* PARTS USED TABLE */}
          <h4>Spare Parts Used</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(job.partsUsed || []).map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>Rs.{p.priceAtUse}</td>
                  <td>
                    <button
                      className="btn ghost"
                      onClick={() => removePart(i)}
                      disabled={!editingAllowed}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <b>Total</b>
                </td>
                <td>
                  <b>Rs.{partsTotal.toFixed(2)}</b>
                </td>
                <td />
              </tr>
            </tbody>
          </table>

          {/* SERVICE CHARGES TABLE */}
          <h4 style={{ marginTop: 16 }}>Service Charges</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((s, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className="input"
                      value={s.description}
                      onChange={(e) =>
                        updateService(i, "description", e.target.value)
                      }
                      disabled={!editingAllowed}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input"
                      value={s.amount}
                      onChange={(e) =>
                        updateService(i, "amount", e.target.value)
                      }
                      disabled={!editingAllowed}
                    />
                  </td>
                  <td>
                    <button
                      className="btn ghost"
                      onClick={() => removeService(i)}
                      disabled={!editingAllowed}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <b>Total</b>
                </td>
                <td>
                  <b>Rs.{servicesTotal.toFixed(2)}</b>
                </td>
                <td />
              </tr>
            </tbody>
          </table>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className="btn"
              onClick={addServiceRow}
              disabled={!editingAllowed}
            >
              Add Service
            </button>
          </div>

          {/* COMPLETE */}
          <div style={{ marginTop: 16 }}>
            <button
              className="btn"
              disabled={!summary.trim() || !editingAllowed}
              onClick={completeJob}
            >
              Complete Job
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
