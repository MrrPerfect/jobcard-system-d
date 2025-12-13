import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

const STATUSES = ['Created','Assigned','In Progress','Done'];

export default function ManagerKanban(){
  const [cards, setCards] = useState([]);
  useEffect(()=>{ load(); }, []);
  const load = async ()=>{ try{ const res = await api.get('/jobcards'); setCards(res.data || []);}catch{alert('Load failed')} };

  const onDrop = async (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    try { await api.patch(`/jobcards/${id}/status`,{status}); setCards(s=>s.map(c=>c._id===id?{...c,status}:c)); } catch { alert('Update failed'); }
  };
  const allow = e => e.preventDefault();
  const onDragStart = (e,id)=>e.dataTransfer.setData('text/plain',id);

  const grouped = STATUSES.reduce((acc,st)=>{ acc[st] = cards.filter(c=>c.status===st); return acc; },{});
  return (
    <Layout>
      <h3>Kanban</h3>
      <div style={{display:'flex',gap:12,marginTop:10}}>
        {STATUSES.map(st=>(
          <div key={st} onDragOver={allow} onDrop={e=>onDrop(e,st)} className="card" style={{flex:1,minHeight:220}}>
            <h4>{st}</h4>
            {grouped[st].map(c=>(
              <div key={c._id} draggable onDragStart={e=>onDragStart(e,c._id)} className="card" style={{marginBottom:8,cursor:'grab'}}>
                <div><strong>{c.vehicleNumber}</strong></div>
                <div className="small">{c.customerName}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}