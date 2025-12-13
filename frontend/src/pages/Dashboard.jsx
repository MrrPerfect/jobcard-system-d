import React from 'react';
import JobCardForm from './JobCardForm';
import JobCardList from './JobCardList';
import TechnicianJobs from './TechnicianJobs';

export default function Dashboard() {
  const role = localStorage.getItem('role');

  return (
    <div>
      <h3>Dashboard ({role})</h3>

      {role === 'service_advisor' && <JobCardForm />}
      {role === 'technician' && <TechnicianJobs />}

      <JobCardList />
    </div>
  );
}
