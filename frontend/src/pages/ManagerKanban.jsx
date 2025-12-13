import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

const STATUSES = ['Created','Assigned','In Progress','Done'];

export default function ManagerKanban(){
  const [cards, setCards] = useState([]);
  const [techs, setTechs] = useState([]);
  const [assigning, setAssigning] = useState({}); // { [jobId]: techId }

  useEffect(()=>{ load(); loadTechs(); }, []);

  const load = async ()=> {
    try {
      const res = await api.get('/jobcards');
      setCards(res.data || []);
    } catch (err) {
      alert('Failed to load job cards');
    }
  };

  const loadTechs = async ()=> {
    try {
      const res = await api.get('/admin/users');
      const techList = (res.data || []).filter(u => u.role === 'technician');
      setTechs(techList);
    } catch (err) {
      // admin/users protected: if 403, still allow manager UI if logged-in manager; otherwise warn
      console.warn('Failed to load technicians', err?.response?.status);
    }
  };

  const onDragStart = (e, id) => e.dataTransfer.setData('text/plain', id);

  const onDrop = async (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    try {
      const res = await api.patch(`/jobcards/${id}/status`, { status });
      setCards(s => s.map(c => c._id === id ? res.data : c));
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    }
  };

  const allow = e => e.preventDefault();

  const assign = async (jobId) => {
    const techId = assigning[jobId];
    if (!techId) return alert('Select a technician');
    try {
      const res = await api.patch(`/jobcards/${jobId}/assign`, { technicianId: techId });
      setCards(s => s.map(c => c._id === jobId ? res.data : c));
      setAssigning(a => { const copy = { ...a }; delete copy[jobId]; return copy; });
    } catch (err) {
      alert(err?.response?.data?.message || 'Assign failed');
    }
  };

  const grouped = STATUSES.reduce((acc, st) => {
    acc[st] = cards.filter(c => c.status === st);
    return acc;
  }, {});

  return (
    <Layout>
      <h3>Kanban & Assign</h3>
      <div style={{display:'flex',gap:12,marginTop:10}}>
        {STATUSES.map(st => (
          <div key={st} onDragOver={allow} onDrop={e=>onDrop(e, st)} className="card" style={{flex:1,minHeight:100}}>
            <h4>{st}</h4>
            {grouped[st].map(c => {
              const isAssigned = !!(c.assignedTo && (c.assignedTo._id || c.assignedTo));
              return (
                <div key={c._id} draggable onDragStart={e=>onDragStart(e,c._id)} className="card" style={{marginBottom:8,cursor:'grab',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{flex:1,marginRight:12}}>
                    <div><strong>{c.vehicleNumber}</strong> — <span className="small">{c.customerName}</span></div>
                    <div className="small" style={{marginTop:6}}>{c.reportedIssue}</div>
                    <div className="small" style={{marginTop:6}}>Assigned: {c.assignedTo?.name || <em>—</em>}</div>
                  </div>

                  {/* show assign controls only when NOT already assigned */}
                  {!isAssigned ? (
                    <div style={{minWidth:200,display:'flex',flexDirection:'column',gap:6}}>
                      <select
                        className="input"
                        value={assigning[c._id] || ''}
                        onChange={e=>setAssigning(a=>({ ...a, [c._id]: e.target.value }))}
                      >
                        <option value="">Select technician</option>
                        {techs.map(t=> <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                      </select>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn" onClick={()=>assign(c._id)}>Assign</button>
                        <button className="btn ghost" onClick={()=>{ setAssigning(a=>{ const copy={...a}; delete copy[c._id]; return copy; }); }}>Clear</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{minWidth:140,textAlign:'right'}} className="small">Assigned</div>
                  )}
                </div>
              );
            })}
            {grouped[st].length === 0 && <div className="small">No cards</div>}
          </div>
        ))}
      </div>
    </Layout>
  );
}

