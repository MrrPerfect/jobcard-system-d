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

  return (
    <Layout>
      <div className="card">
        <h3>Job Cards</h3>
        <table className="table" style={{marginTop:10}}>
          <thead><tr><th>#</th><th>Vehicle</th><th>Customer</th><th>Status</th><th>Tech</th></tr></thead>
          <tbody>
            {jobs.map((j,i)=>(
              <tr key={j._id}>
                <td>{i+1}</td>
                <td><strong>{j.vehicleNumber}</strong><div className="small">{j.vehicleType}</div></td>
                <td>{j.customerName}<div className="small">{j.customerPhone}</div></td>
                <td>{j.status} {j.critical && <span className="badge" style={{marginLeft:8}}>Critical</span>}</td>
                <td>{j.assignedTo?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}