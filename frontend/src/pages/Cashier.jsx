import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import Layout from "../components/Layout.jsx";
import { jsPDF } from "jspdf";

export default function Cashier() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [billCounts, setBillCounts] = useState({});
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await api.get("/jobcards");
      const doneJobs = (res.data || []).filter((j) => j.status === "Done");
      setJobs(doneJobs);

      const counts = {};
      await Promise.all(
        doneJobs.map(async (j) => {
          try {
            const b = await api.get(`/billing/by-job/${j._id}`);
            counts[j._id] = {
              prints: b.data.prints || 0,
              lastPrintedAt: b.data.lastPrintedAt || b.data.updatedAt,
            };
          } catch {
            counts[j._id] = { prints: 0 };
          }
        }),
      );
      setBillCounts(counts);
    } catch {
      alert("Failed to load completed jobs");
    }
  };

  const fmt = (v) => (v ? new Date(v).toLocaleString() : "-");

  const openPreview = async () => {
    if (!selected) return alert("Select a job first");

    try {
      const res = await api.get(`/jobcards/${selected}`);
      const job = res.data;

      const parts = (job.partsUsed || []).map((p) => {
        const qty = Number(p.qty || 0);
        const price = Number(p.priceAtUse || 0);
        return {
          name: p.name,
          qty,
          unitPrice: price,
          total: qty * price,
        };
      });

      const partsTotal = parts.reduce((s, i) => s + i.total, 0);

      const services = (job.serviceCharges || []).map((sc) => ({
        description: sc.description,
        amount: sc.amount,
      }));

      const servicesTotal = services.reduce((s, i) => s + i.amount, 0);

      setPreviewData({
        job,
        parts,
        services,
        partsTotal,
        servicesTotal,
        grandTotal: partsTotal + servicesTotal,
      });
    } catch {
      alert("Failed to load job details");
    }
  };

  const generatePdf = (bill) => {
    if (!previewData) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Workshop Invoice", 14, 20);
    doc.setFontSize(10);
    doc.text(`Bill ID: ${bill._id}`, 14, 28);
    doc.text(`Vehicle: ${previewData.job.vehicleNumber}`, 14, 34);
    doc.text(`Customer: ${previewData.job.customerName}`, 14, 40);

    let y = 50;
    doc.text("Description", 14, y);
    doc.text("Qty", 120, y);
    doc.text("Unit", 140, y);
    doc.text("Total", 170, y);
    y += 6;

    previewData.parts.forEach((p) => {
      doc.text(p.name, 14, y);
      doc.text(String(p.qty), 120, y);
      doc.text(String(p.unitPrice), 140, y);
      doc.text(String(p.total), 170, y);
      y += 6;
    });

    previewData.services.forEach((s) => {
      doc.text(s.description, 14, y);
      doc.text("-", 120, y);
      doc.text("-", 140, y);
      doc.text(String(s.amount), 170, y);
      y += 6;
    });

    y += 8;
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs. ${previewData.grandTotal}`, 14, y);

    doc.save(`bill_${bill._id}.pdf`);
  };

  const generateBill = async () => {
    if (!previewData) return;
    try {
      const res = await api.post("/billing/create", {
        jobCardId: previewData.job._id,
      });
      generatePdf(res.data);
      setPreviewData(null);
      loadJobs();
    } catch (err) {
      alert(err?.response?.data?.message || "Billing failed");
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const created = new Date(j.createdAt);
    if (filterFrom && new Date(filterFrom) > created) return false;
    if (filterTo && new Date(filterTo) < created) return false;
    return true;
  });

  return (
    <Layout>
      <div style={{ display: "flex", gap: 16 }}>
        {/* LEFT PANEL */}
        <div
          className="card"
          style={{ flex: 1, maxHeight: "80vh", overflowY: "auto" }}
        >
          <h4>Completed Jobs</h4>

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="datetime-local"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
            <input
              type="datetime-local"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
            <button
              className="btn ghost"
              onClick={() => {
                setFilterFrom("");
                setFilterTo("");
              }}
            >
              Clear
            </button>
          </div>

          {filteredJobs.map((j, i) => {
            const bc = billCounts[j._id] || {};
            return (
              <div
                key={j._id}
                onClick={() => setSelected(j._id)}
                style={{
                  padding: 10,
                  marginBottom: 8,
                  border:
                    selected === j._id ? "2px solid #4f46e5" : "1px solid #ddd",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <div>
                  <strong>
                    {i + 1}. {j.vehicleNumber}
                  </strong>{" "}
                  — {j.customerName}
                </div>
                <div className="small">Done: {fmt(j.updatedAt)}</div>
                {/* <div className="small">Bills: {bc.prints || 0}</div> */}
                {bc.lastPrintedAt && (
                  <div className="small">
                    Last Printed: {fmt(bc.lastPrintedAt)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT PANEL */}
        <div className="card" style={{ flex: 1 }}>
          <h4>Billing Preview</h4>
          {!selected && (
            <div className="small">Select a job to preview bill</div>
          )}

          {selected && (
            <div style={{ marginBottom: 12 }}>
              <button className="btn" onClick={openPreview}>
                Preview & Generate Bill
              </button>
            </div>
          )}

          {/* PREVIEW TABLE BELOW BUTTON */}
          {previewData && (
            <div style={{ marginTop: 10 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.parts.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.qty}</td>
                      <td>{p.unitPrice}</td>
                      <td>{p.total}</td>
                    </tr>
                  ))}
                  {previewData.services.map((s, i) => (
                    <tr key={`s${i}`}>
                      <td>{s.description}</td>
                      <td>-</td>
                      <td>-</td>
                      <td>{s.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "right", marginTop: 10 }}>
                <strong>Grand Total: Rs. {previewData.grandTotal}</strong>
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                <button
                  className="btn ghost"
                  onClick={() => setPreviewData(null)}
                >
                  Cancel
                </button>
                <button className="btn" onClick={generateBill}>
                  Generate Bill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
