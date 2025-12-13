import React, { useState } from 'react';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function JobCardForm() {
  const [form, setForm] = useState({
    vehicleType: '2W',
    vehicleNumber: '',
    customerName: '',
    customerPhone: '',
    reportedIssue: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.vehicleNumber || !form.customerName) {
      alert('Vehicle number and customer name are required');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/jobcards', form);
      setForm({ vehicleType: '2W', vehicleNumber: '', customerName: '', customerPhone: '', reportedIssue: '' });
      nav('/jobcards');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create job card');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>Create Job Card</h3>

      <select value={form.vehicleType} onChange={e => setForm({...form, vehicleType: e.target.value})}>
        <option value="2W">2 Wheeler</option>
        <option value="4W">4 Wheeler</option>
      </select><br/>

      <input placeholder="Vehicle Number" value={form.vehicleNumber}
        onChange={e=>setForm({...form, vehicleNumber:e.target.value})} /><br/>

      <input placeholder="Customer Name" value={form.customerName}
        onChange={e=>setForm({...form, customerName:e.target.value})} /><br/>

      <input placeholder="Customer Phone" value={form.customerPhone}
        onChange={e=>setForm({...form, customerPhone:e.target.value})} /><br/>

      <textarea placeholder="Reported Issue" value={form.reportedIssue}
        onChange={e=>setForm({...form, reportedIssue:e.target.value})} /><br/>

      <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
    </form>
  );
}