import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const STATUSES = ['Created','Assigned','In Progress','Done'];

export default function ManagerKanban(){
  const [cards, setCards] = useState([]);

  useEffect(()=>{ load(); }, []);
  const load = async () => {
    const res = await api.get('/jobcards');
    setCards(res.data || []);
  };

  const onDragStart = (e, id) => e.dataTransfer.setData('text/plain', id);
  const onDrop = async (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    try {
      await api.patch(`/jobcards/${id}/status`, { status });
      setCards(s => s.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    }
  };
  const allow = e => e.preventDefault();

  const grouped = STATUSES.reduce((acc, st) => {
    acc[st] = cards.filter(c => c.status === st);
    return acc;
  }, {});

  return (
    <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
      {STATUSES.map(st => (
        <div key={st} onDragOver={allow} onDrop={e=>onDrop(e, st)} style={{flex:1, minHeight:200, padding:8, border:'1px solid #ccc'}}>
          <h4>{st}</h4>
          {grouped[st].map(c => (
            <div key={c._id} draggable onDragStart={e=>onDragStart(e, c._id)} style={{padding:8, marginBottom:8, background:'#fafafa', cursor:'grab'}}>
              <div><strong>{c.vehicleNumber}</strong> — {c.customerName}</div>
              <div>{c.reportedIssue}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}