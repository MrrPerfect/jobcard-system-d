import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

export default function Cashier(){
  const [jobs,setJobs]=useState([]); const [parts,setParts]=useState([]); const [selected,setSelected]=useState(null); const [cart,setCart]=useState([]);
  useEffect(()=>{ load(); loadParts(); }, []);
  const load=async()=>{ try{ const r=await api.get('/jobcards'); setJobs(r.data||[]);}catch{alert('Load failed')} };
  const loadParts=async()=>{ try{ const r=await api.get('/inventory/parts'); setParts(r.data||[]);}catch{alert('Parts failed')} };

  const add=(partId)=>{ const ex=cart.find(c=>c.partId===partId); if(ex) setCart(c=>c.map(x=>x.partId===partId?{...x,qty:x.qty+1}:x)); else setCart(c=>[...c,{partId,qty:1}]); };
  const changeQty=(partId,qty)=>setCart(c=>c.map(x=>x.partId===partId?{...x,qty}:x));
  const createBill=async()=>{ if(!selected) return alert('Select job'); try{ const r=await api.post('/billing/create',{jobCardId:selected, parts:cart}); alert('Bill created: '+r.data._id); setCart([]); load(); }catch(err){ alert(err?.response?.data?.message || 'Billing failed') } };

  return (
    <Layout>
      <div style={{display:'flex',gap:12}}>
        <div className="card" style={{flex:1}}>
          <h4>Completed Jobs</h4>
          <ul>
            {jobs.map(j=>(
              <li key={j._id}><label><input type="radio" name="job" onChange={()=>setSelected(j._id)} /> {j.vehicleNumber} — <span className="small">{j.customerName}</span></label></li>
            ))}
          </ul>
        </div>

        <div className="card" style={{flex:1}}>
          <h4>Parts</h4>
          <ul>
            {parts.map(p=>(
              <li key={p.id}>{p.name} ({p.stock}) — Rs.{p.price} <button className="btn ghost" onClick={()=>add(p.id)}>Add</button></li>
            ))}
          </ul>
        </div>

        <div className="card" style={{flex:1}}>
          <h4>Cart</h4>
          <ul>
            {cart.map(c=>{ const m=parts.find(p=>p.id===c.partId)||{}; return <li key={c.partId}>{m.name} — <input style={{width:60}} type="number" value={c.qty} onChange={e=>changeQty(c.partId, Number(e.target.value))} /> — Rs.{m.price*c.qty}</li> })}
          </ul>
          <div style={{marginTop:8}}><button className="btn" onClick={createBill}>Generate Bill</button></div>
        </div>
      </div>
    </Layout>
  );
}