import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function Cashier(){
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(()=>{ load(); loadParts(); }, []);
  const load = async ()=> {
    const res = await api.get('/jobcards'); // cashier sees Done
    setJobs(res.data || []);
  };
  const loadParts = async ()=> {
    const res = await api.get('/inventory/parts');
    setParts(res.data || []);
  };

  const addPart = (partId) => {
    const existing = cart.find(c => c.partId === partId);
    if (existing) setCart(cart.map(c => c.partId === partId ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { partId, qty: 1 }]);
  };

  const changeQty = (partId, qty) => setCart(cart.map(c=> c.partId===partId ? { ...c, qty } : c));

  const createBill = async () => {
    if (!selectedJob) return alert('Select job');
    try {
      const res = await api.post('/billing/create', { jobCardId: selectedJob, parts: cart });
      alert('Bill created: ' + res.data._id);
      setCart([]);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Billing failed');
    }
  };

  return (
    <div style={{display:'flex', gap:20}}>
      <div style={{flex:1}}>
        <h4>Completed Jobs</h4>
        <ul>
          {jobs.map(j => (
            <li key={j._id}>
              <label>
                <input type="radio" name="job" value={j._id} onChange={()=>setSelectedJob(j._id)} />
                {j.vehicleNumber} — {j.customerName}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div style={{flex:1}}>
        <h4>Parts</h4>
        <ul>
          {parts.map(p => (
            <li key={p.id}>
              {p.name} ({p.stock}) — Rs.{p.price} <button onClick={()=>addPart(p.id)}>Add</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{flex:1}}>
        <h4>Cart</h4>
        <ul>
          {cart.map(c => {
            const meta = parts.find(p => p.id === c.partId) || {};
            return (
              <li key={c.partId}>
                {meta.name} — Qty:
                <input type="number" value={c.qty} min={1} onChange={e=>changeQty(c.partId, Number(e.target.value))} style={{width:60}} />
                — Unit: {meta.price} — Total: {meta.price * c.qty}
              </li>
            );
          })}
        </ul>
        <button onClick={createBill}>Generate Bill</button>
      </div>
    </div>
  );
}