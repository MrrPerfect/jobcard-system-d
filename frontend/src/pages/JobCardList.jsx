import React,{ useEffect, useState } from 'react';
import api from '../services/api.js';

export default function JobCardList(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ fetchJobs(); }, []);
  const fetchJobs = async ()=> {
    try {
      const res = await api.get('/jobcards');
      setJobs(res.data);
    } catch (err) {
      alert('Failed to load job cards');
    }
  };

  return (
    <div>
      <h3>Job Cards</h3>
      {jobs.length === 0 && <div>No job cards</div>}
      <ul>
        {jobs.map(j => (
          <li key={j._id}>
            <strong>{j.vehicleNumber}</strong> — {j.customerName} — {j.status}
            {j.assignedTo && <span> — Tech: {j.assignedTo.name || j.assignedTo}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}


