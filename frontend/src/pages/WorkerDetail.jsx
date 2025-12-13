import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

export default function WorkerDetail(){
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(()=>{ load(); }, [id]);

  const load = async () => {
    setError('');
    setUser(null);
    try {
      // Try direct single-user admin endpoint first
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUser(res.data);
      } catch (err) {
        // if single-user not found, try lists (safer across backend variations)
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          // try full users list
          try {
            const all = await api.get('/admin/users');
            const found = (all.data || []).find(u => u._id === id);
            if (found) {
              setUser(found);
            } else {
              // try pending list
              const pending = await api.get('/admin/users/pending');
              const pfound = (pending.data || []).find(u => u._id === id);
              if (pfound) setUser(pfound);
              else setError('User not found.');
            }
          } catch (listErr) {
            setError('User not found or access denied.');
          }
        } else {
          throw err;
        }
      }

      // fetch jobcards and filter by assignedTo id (only if user found)
      if (user === null) {
        // state update may be async; re-fetch user from server if we set via lists above
        // get current user from server-side lists to ensure we have id
        const cur = await api.get('/admin/users').catch(()=>null);
        const maybe = cur?.data?.find(u=>u._id===id);
        if (maybe) setUser(maybe);
      }

      if (!user && !error) {
        // if still no user after attempts, try to proceed cautiously
        const maybeUser = await (async()=>{
          try { const res = await api.get(`/admin/users/${id}`); return res.data; } catch{return null}
        })();
        if (maybeUser) setUser(maybeUser);
      }

      // now load jobs regardless (will filter even if user exists from lists)
      const r2 = await api.get('/jobcards');
      setJobs((r2.data || []).filter(j => {
        const at = j.assignedTo;
        const assignedId = at?._id || at;
        return String(assignedId) === String(id);
      }));
    } catch (err) {
      if (err?.response?.status === 403) {
        setError('You are not authorized to view this user.');
      } else if (err?.response?.status === 404) {
        setError('User not found.');
      } else {
        setError('Failed to load user details.');
      }
      setUser(null);
    }
  };

  const approve = async () => {
    if (!confirm('Approve this user?')) return;
    try {
      await api.patch(`/admin/users/${id}/approve`);
      alert('User approved');
      load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Approve failed');
    }
  };

  const remove = async () => {
    if (!confirm('Delete this user? This action is permanent.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      alert('User deleted');
      nav('/admin');
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    }
  };

  if (error) return <Layout><div className="card"><div className="small">{error}</div></div></Layout>;
  if (!user) return <Layout><div className="card"><div className="small">Loading user...</div></div></Layout>;

  return (
    <Layout>
      <div className="card">
        <h3>{user.name}</h3>
        <div className="small">{user.email} — <strong>{user.role}</strong></div>
        <div style={{marginTop:8}}>Phone: {user.phone || '-'}</div>
        <div style={{marginTop:4}}>Address: {user.address || '-'}</div>
        <div style={{marginTop:8}}>
          {!user.approved ? <button className="btn" onClick={approve}>Approve</button> : <span className="small">Approved</span>}
          <button className="btn ghost" onClick={remove} style={{marginLeft:8}}>Delete</button>
        </div>
      </div>

      <div className="card">
        <h4>Assigned Jobs</h4>
        <ul>
          {jobs.map(j => <li key={j._id}>{j.vehicleNumber} — {j.customerName} — {j.status}</li>)}
          {jobs.length === 0 && <div className="small">No assigned jobs</div>}
        </ul>
      </div>
    </Layout>
  );
}