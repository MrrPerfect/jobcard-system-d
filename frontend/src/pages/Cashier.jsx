import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import Layout from "../components/Layout.jsx";
import { jsPDF } from "jspdf";

export default function Cashier() {
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [billCounts, setBillCounts] = useState({}); // { jobId: {prints, lastPrintedAt, id} }
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    load();
    loadParts();
  }, []);

  const load = async () => {
    try {
      const r = await api.get("/jobcards");
      const doneJobs = (r.data || []).filter((j) => j.status === "Done");
      setJobs(doneJobs);
      const counts = {};
      await Promise.all(
        doneJobs.map(async (j) => {
          try {
            const b = await api.get(`/billing/by-job/${j._id}`);
            counts[j._id] = {
              prints: b.data.prints || 0,
              lastPrintedAt: b.data.lastPrintedAt || b.data.updatedAt || b.data.createdAt,
              id: b.data._id
            };
          } catch (e) {
            counts[j._id] = { prints: 0 };
          }
        })
      );
      setBillCounts(counts);
    } catch (err) {
      alert("Load failed");
    }
  };

  const loadParts = async () => {
    try {
      const r = await api.get("/inventory/parts");
      setParts(r.data || []);
    } catch {
      alert("Parts failed");
    }
  };

  const add = (partId) => {
    const ex = cart.find((c) => c.partId === partId);
    if (ex) setCart((c) => c.map((x) => (x.partId === partId ? { ...x, qty: x.qty + 1 } : x)));
    else setCart((c) => [...c, { partId, qty: 1 }]);
  };
  const changeQty = (partId, qty) => setCart((c) => c.map((x) => (x.partId === partId ? { ...x, qty } : x)));
  const remove = (partId) => setCart((c) => c.filter((x) => x.partId !== partId));

  const fmt = (v) => (v ? new Date(v).toLocaleString() : "-");

  const openPreview = async () => {
    if (!selected) return alert("Select job");
    try {
      const res = await api.get(`/jobcards/${selected}`);
      const job = res.data;
      const selectedParts = cart.map((c) => {
        const meta = parts.find((p) => p.id === c.partId) || {};
        return { ...c, name: meta.name || c.partId, unitPrice: meta.price || 0, total: (meta.price || 0) * c.qty };
      });
      const partsTotal = selectedParts.reduce((s, i) => s + i.total, 0);
      const serviceCharges = (job.serviceCharges || []).map((sc) => ({ description: sc.description, amount: sc.amount }));
      const servicesTotal = serviceCharges.reduce((s, i) => s + i.amount, 0);
      const grandTotal = partsTotal + servicesTotal;
      setPreviewData({ job, selectedParts, partsTotal, serviceCharges, servicesTotal, grandTotal });
      setPreviewOpen(true);
    } catch (err) {
      alert("Failed to load job details");
    }
  };

  const generatePdf = (bill) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Workshop Invoice", 14, 20);
    doc.setFontSize(10);
    doc.text(`Bill ID: ${bill._id}`, 14, 28);
    if (bill.prints) doc.text(`Prints: ${bill.prints}`, 100, 28);
    doc.text(`Job: ${previewData.job.vehicleNumber} - ${previewData.job.customerName}`, 14, 34);
    let y = 44;
    doc.text("No.", 14, y);
    doc.text("Description", 34, y);
    doc.text("Qty", 120, y);
    doc.text("Unit", 140, y);
    doc.text("Total", 170, y);
    y += 6;
    doc.setFontSize(9);
    let idx = 1;
    previewData.selectedParts.forEach((it) => {
      doc.text(String(idx++), 14, y);
      doc.text(it.name, 34, y);
      doc.text(String(it.qty), 120, y);
      doc.text(String(it.unitPrice), 140, y);
      doc.text(String(it.total), 170, y);
      y += 6;
    });
    if (previewData.serviceCharges.length) {
      previewData.serviceCharges.forEach((sc) => {
        doc.text(String(idx++), 14, y);
        doc.text(sc.description, 34, y);
        doc.text("-", 120, y);
        doc.text(String(sc.amount), 170, y);
        y += 6;
      });
    }
    y += 8;
    doc.setFontSize(11);
    doc.text(`Total: Rs. ${previewData.grandTotal}`, 14, y);
    doc.save(`bill_${bill._id}.pdf`);
  };

  const confirmAndCreate = async () => {
    if (!previewData) return;
    try {
      const payloadParts = previewData.selectedParts.map((p) => ({ partId: p.partId, qty: p.qty }));
      const res = await api.post("/billing/create", { jobCardId: previewData.job._id, parts: payloadParts });
      const b = res.data;
      // update counts immediately with returned bill document (prints incremented on server)
      setBillCounts((prev) => ({ ...prev, [previewData.job._id]: { prints: b.prints || 1, lastPrintedAt: b.lastPrintedAt || b.updatedAt || b.createdAt, id: b._id } }));
      // show same bill id even for reprints
      alert(`Bill generated. Bill ID: ${b._id} (prints: ${b.prints || 1})`);
      generatePdf(b);
      setPreviewOpen(false);
      setCart([]);
      // refresh jobs optionally
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Billing failed");
    }
  };

  // filter jobs by createdAt range
  const filteredJobs = jobs.filter((j) => {
    if (!filterFrom && !filterTo) return true;
    const created = new Date(j.createdAt || j.created_at || j.created);
    if (filterFrom && new Date(filterFrom) > created) return false;
    if (filterTo && new Date(filterTo) < created) return false;
    return true;
  });

  return (
    <Layout>
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <div className="card" style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>Completed Jobs</h4>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label className="small">From</label>
              <input type="datetime-local" className="input" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
              <label className="small">To</label>
              <input type="datetime-local" className="input" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
              <button className="btn ghost" onClick={() => { setFilterFrom(""); setFilterTo(""); }}>Clear</button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {filteredJobs.length === 0 && <div className="small">No completed jobs</div>}
            {filteredJobs.map((j, idx) => {
              const bc = billCounts[j._id] || { prints: 0, lastPrintedAt: null };
              const isSelected = selected === j._id;
              return (
                <div key={j._id} onClick={() => setSelected(j._id)} style={{ display: "flex", justifyContent: "space-between", padding: 12, marginBottom: 8, borderRadius: 8, cursor: "pointer", background: isSelected ? "#eef6ff" : "#fff", border: isSelected ? "1px solid #cfe3ff" : "1px solid #eee" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{idx + 1}. {j.vehicleNumber} <span className="small" style={{ fontWeight: 400 }}>— {j.customerName}</span></div>
                    <div className="small">Created: {fmt(j.createdAt || j.created_at || j.created)}</div>
                    <div className="small">Job ID: {j._id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="small">Bills: <strong>{bc.prints || 0}</strong></div>
                    {bc.lastPrintedAt && <div className="small">Last: {fmt(bc.lastPrintedAt)}</div>}
                    <div style={{ marginTop: 8 }}>
                      <button className="btn" onClick={(e) => { e.stopPropagation(); setSelected(j._id); }}>Select</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h4>Parts</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 8 }}>{p.name} <div className="small">Stock: {p.stock} — Rs.{p.price}</div></td>
                  <td style={{ width: 110, textAlign: "right", padding: 8 }}>
                    <button className="btn ghost" onClick={() => add(p.id)}>Add</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h4>Cart & Preview</h4>
          <div style={{ marginTop: 8 }}>
            {cart.length === 0 ? <div className="small">Cart empty</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr><th style={{ textAlign: "left", padding: 8 }}>#</th><th style={{ textAlign: "left", padding: 8 }}>Item</th><th style={{ padding: 8 }}>Qty</th><th style={{ padding: 8 }}>Total</th><th style={{ padding: 8 }} /></tr>
                </thead>
                <tbody>
                  {cart.map((c, i) => {
                    const m = parts.find((p) => p.id === c.partId) || {};
                    return (
                      <tr key={c.partId}>
                        <td style={{ padding: 8 }}>{i + 1}</td>
                        <td style={{ padding: 8 }}>{m.name}</td>
                        <td style={{ padding: 8 }}><input style={{ width: 60 }} type="number" value={c.qty} min={1} onChange={(e) => changeQty(c.partId, Number(e.target.value))} /></td>
                        <td style={{ padding: 8 }}>Rs.{(m.price || 0) * c.qty}</td>
                        <td style={{ padding: 8 }}><button className="btn ghost" onClick={() => remove(c.partId)}>Remove</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="btn" onClick={openPreview} disabled={!selected}>Preview & Generate Bill</button>
            <button className="btn ghost" onClick={() => { setCart([]); }}>Clear Cart</button>
          </div>
        </div>
      </div>

      {previewOpen && previewData && (
        <div style={{ position: "fixed", left: 0, top: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 720, maxHeight: "80vh", overflowY: "auto", background: "#fff", padding: 18, borderRadius: 8 }}>
            <h3>Bill Preview</h3>
            <div className="small">Job: {previewData.job.vehicleNumber} — {previewData.job.customerName}</div>
            <table className="table" style={{ marginTop: 10 }}>
              <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
              <tbody>
                {previewData.selectedParts.map((p, i) => (
                  <tr key={p.partId}><td>{i + 1}</td><td>{p.name}</td><td>{p.qty}</td><td>{p.unitPrice}</td><td>{p.total}</td></tr>
                ))}
                {previewData.serviceCharges.map((s, i) => (
                  <tr key={"svc" + i}><td>{previewData.selectedParts.length + i + 1}</td><td>{s.description}</td><td>-</td><td>{s.amount}</td><td>{s.amount}</td></tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", marginTop: 10 }}><strong>Grand Total: Rs. {previewData.grandTotal}</strong></div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button className="btn ghost" onClick={() => setPreviewOpen(false)}>Close</button>
              <button className="btn" onClick={confirmAndCreate}>Generate Bill & PDF</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
