import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

export default function Dashboard(){
  const role = localStorage.getItem('role');
  const nav = useNavigate();
  return (
    <Layout>
      <div className="grid cols-3" style={{marginBottom:12}}>
        <div className="card">
          <h4>Quick Actions</h4>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            {role === 'advisor' && <button className="btn" onClick={()=>nav('/jobcards/new')}>Create Job Card</button>}
            <button className="btn ghost" onClick={()=>nav('/jobcards')}>List Job Cards</button>
            {role === 'technician' && <button className="btn" onClick={()=>nav('/technician')}>My Jobs</button>}
          </div>
        </div>

        <div className="card">
          <h4>Info</h4>
          <p className="small">This demo supports advisor → technician → manager → cashier flows. Use seeded users (advisor@example.com / pass123, tech@example.com / pass123, manager@example.com / pass123, cashier@example.com / pass123).</p>
        </div>

        <div className="card">
          <h4>Help</h4>
          <p className="small">Contact dev for integration or add mock inventory/billing in the admin panel.</p>
        </div>
      </div>
    </Layout>
  );
}