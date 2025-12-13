import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

export default function TechnicianJobs(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ load(); }, []);
  const load = async ()=> { try { const res = await api.get('/jobcards'); setJobs(res.data || []); } catch { alert('Load failed'); } };

  const update = async (id, payload) => {
    try {
      await api.patch(`/jobcards/${id}/status`, payload);
      setJobs(s => s.map(j => j._id === id ? { ...j, ...payload } : j));
    } catch (err) { alert(err?.response?.data?.message || 'Update failed'); }
  };

  return (
    <Layout>
      <div className="card">
        <h3>My Jobs</h3>
        <div style={{display:'grid',gap:12,marginTop:10}}>
          {jobs.map(j => (
            <div key={j._id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div><strong>{j.vehicleNumber}</strong> — <span className="small">{j.customerName}</span></div>
                <div className="small">{j.reportedIssue}</div>
                <div style={{marginTop:6}}><span className="small">Status:</span> <strong>{j.status}</strong></div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {j.status === 'Assigned' && <button className="btn" onClick={()=>update(j._id,{status:'In Progress'})}>Start</button>}
                {j.status === 'In Progress' && <button className="btn" onClick={()=>update(j._id,{status:'Done'})}>Complete</button>}
                <button className="btn ghost" onClick={()=>update(j._id,{critical:!j.critical})}>{j.critical ? 'Unset Critical' : 'Mark Critical'}</button>
                <button className="btn ghost" onClick={async ()=>{ const s = prompt('Final summary'); if (s) update(j._id,{finalSummary:s}); }}>Add Summary</button>
              </div>
            </div>
          ))}
          {jobs.length===0 && <div className="small">No jobs assigned.</div>}
        </div>
      </div>
    </Layout>
  );
}