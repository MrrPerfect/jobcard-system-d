import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function TechnicianJobs(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ load(); }, []);
  const load = async ()=> {
    try {
      const res = await api.get('/jobcards');
      setJobs(res.data);
    } catch (err) { alert('Failed to load'); }
  };

  const update = async (id, payload) => {
    try {
      await api.patch(`/jobcards/${id}/status`, payload);
      setJobs(s => s.map(j => j._id === id ? { ...j, ...payload } : j));
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <h3>Technician Jobs</h3>
      <ul>
        {jobs.map(j => (
          <li key={j._id}>
            <div>
              <strong>{j.vehicleNumber}</strong> — {j.customerName} — {j.status}
            </div>
            <div>
              {j.status === 'Assigned' && <button onClick={()=>update(j._id, { status: 'In Progress' })}>Start</button>}
              {j.status === 'In Progress' && <button onClick={()=>update(j._id, { status: 'Done' })}>Complete</button>}
              <button onClick={()=>update(j._id, { critical: !j.critical })}>{j.critical ? 'Unset Critical' : 'Mark Critical'}</button>
              <button onClick={async ()=> {
                const summary = prompt('Final summary');
                if (summary) update(j._id, { finalSummary: summary });
              }}>Add Summary</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}