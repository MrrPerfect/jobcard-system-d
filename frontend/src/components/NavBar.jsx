import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavBar(){
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const nav = useNavigate();
  const logout = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('name'); nav('/login'); };

  return (
    <div className="header">
      <div className="brand">JobCard — Service</div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <nav className="nav">
          <Link className="link" to="/dashboard">Dashboard</Link>
          <Link className="link" to="/jobcards">JobCards</Link>
          {role === 'advisor' && <Link className="link" to="/jobcards/new">Create</Link>}
          {role === 'technician' && <Link className="link" to="/technician">My Jobs</Link>}
          {role === 'manager' && <Link className="link" to="/manager">Kanban</Link>}
          {role === 'manager' && <Link className="link" to="/admin">Admin</Link>}
          {role === 'cashier' && <Link className="link" to="/cashier">Billing</Link>}
        </nav>
        <div className="card small" style={{padding:'6px 10px'}}>{name} <span className="small">({role})</span></div>
        <button className="btn ghost" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}