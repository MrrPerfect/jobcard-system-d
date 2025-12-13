import { useEffect, useState } from 'react';
import api from '../services/api';

export default function JobCardList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get('/jobcards').then(res => setJobs(res.data));
  }, []);

  return (
    <div>
      <h3>Job Cards</h3>
      {jobs.map(j => (
        <div key={j._id} style={{border:'1px solid #ccc', padding:8, margin:8}}>
          <b>{j.vehicleNumber}</b> ({j.vehicleType})<br/>
          Customer: {j.customerName}<br/>
          Issue: {j.reportedIssue}<br/>
          Status: {j.status}
        </div>
      ))}
    </div>
  );
}
