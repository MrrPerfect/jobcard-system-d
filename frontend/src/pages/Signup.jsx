import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

export default function Signup(){
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'advisor', phone:'', address:'' });
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // use api instance which has a proper baseURL
      await api.post('/auth/register', form);
      alert('Registered. Await admin approval.');
      nav('/login');
    } catch (err) {
      alert(err?.response?.data?.message || 'Signup failed');
    } finally { setSubmitting(false); }
  };

  return (
    <Layout>
      <div className="card" style={{maxWidth:600,margin:'0 auto'}}>
        <h3>Sign up (Advisor / Technician / Cashier)</h3>
        <form onSubmit={submit} style={{marginTop:8, display:'flex', flexDirection:'column', gap:12}}>
          <input className="input" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          <select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
            <option value="advisor">Advisor</option>
            <option value="technician">Technician</option>
            <option value="cashier">Cashier</option>
          </select>
          <input className="input" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <input className="input" placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Signing...' : 'Sign Up'}</button>
            <button className="btn ghost" type="button" onClick={()=>nav('/login')}>Back to Login</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}