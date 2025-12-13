import React, { useState } from 'react';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

export default function JobCardForm() {
  const [form, setForm] = useState({ vehicleType:'2W', vehicleNumber:'', customerName:'', customerPhone:'', reportedIssue:'' });
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.vehicleNumber || !form.customerName) return alert('Vehicle number and customer name required');
    try {
      setSubmitting(true);
      await api.post('/jobcards', form);
      alert('Created');
      nav('/jobcards');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create');
    } finally { setSubmitting(false); }
  };

  return (
    <Layout>
      <div className="card">
        <h3>Create Job Card</h3>
        <form onSubmit={submit} style={{marginTop:10}}>
          <div className="form-row">
            <select className="input" value={form.vehicleType} onChange={e=>setForm({...form, vehicleType:e.target.value})}>
              <option value="2W">2 Wheeler</option>
              <option value="4W">4 Wheeler</option>
            </select>
            <input className="input" placeholder="Vehicle Number" value={form.vehicleNumber} onChange={e=>setForm({...form, vehicleNumber:e.target.value})} />
          </div>

          <div className="form-row">
            <input className="input" placeholder="Customer Name" value={form.customerName} onChange={e=>setForm({...form, customerName:e.target.value})} />
            <input className="input" placeholder="Customer Phone" value={form.customerPhone} onChange={e=>setForm({...form, customerPhone:e.target.value})} />
          </div>

          <div style={{marginBottom:10}}>
            <textarea className="input" placeholder="Reported Issue" value={form.reportedIssue} onChange={e=>setForm({...form, reportedIssue:e.target.value})} />
          </div>

          <div style={{display:'flex',gap:8}}>
            <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
            <button className="btn ghost" type="button" onClick={()=>nav('/jobcards')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}