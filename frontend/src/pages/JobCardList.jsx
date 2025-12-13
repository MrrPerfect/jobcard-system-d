import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';
import { useNavigate } from 'react-router-dom';

export default function JobCardList(){
  const [jobs, setJobs] = useState([]);
  const nav = useNavigate();
  useEffect(()=>{ fetchJobs(); }, []);
  const fetchJobs = async ()=> {
    try { const res = await api.get('/jobcards'); setJobs(res.data || []); } catch (err) { alert('Failed to load job cards'); }
  };

  const fmt = (v) => v ? new Date(v).toLocaleString() : '-';

  const getAssignedAt = (j) => {
    if (j.assignedAt) return j.assignedAt;
    if (Array.isArray(j.assignHistory) && j.assignHistory.length) {
      // find last history entry where 'to' was set
      const last = [...j.assignHistory].reverse().find(h => h && (h.to || h.at));
      if (last) return last.at || null;
    }
    return null;
  };

  const getCompletedAt = (j) => {
    if (j.completedAt) return j.completedAt;
    if (j.status === 'Done') return j.updatedAt || j.completedAt || null;
    return null;
  };

  return (
    <Layout>
      <div className="card">
        <h3>Job Cards</h3>
        <table className="table" style={{marginTop:10}}>
          <thead>
            <tr>
              <th>#</th>
              <th>Vehicle</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Technician</th>
              <th>Assigned At</th>
              <th>Advisor</th>
              <th>Created At</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j,i)=>(
              <tr key={j._id}>
                <td>{i+1}</td>
                <td>
                  <strong>{j.vehicleNumber}</strong>
                  <div className="small">{j.vehicleType}</div>
                </td>
                <td>
                  {j.customerName}
                  <div className="small">{j.customerPhone}</div>
                </td>
                <td>
                  {j.status} {j.critical && <span className="badge" style={{marginLeft:8}}>Critical</span>}
                </td>
                <td>{j.assignedTo?.name || '-'}</td>
                <td className="small">{fmt(getAssignedAt(j))}</td>
                <td className="small">{j.createdBy?.name || '-'}</td>
                <td className="small">{fmt(j.createdAt || j.created_at || j.created)}</td>
                <td className="small">{fmt(getCompletedAt(j))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}