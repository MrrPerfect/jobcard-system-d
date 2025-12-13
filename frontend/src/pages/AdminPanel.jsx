import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

export default function AdminPanel(){
  const [users,setUsers] = useState([]);
  useEffect(()=>{ load(); }, []);
  const load = async ()=>{ try{ const res = await api.get('/admin/users'); setUsers(res.data || []); }catch{ alert('Load failed') } };

  const changeRole = async (id,role)=>{ try{ await api.patch(`/admin/users/${id}/role`,{role}); load(); }catch(err){ alert(err?.response?.data?.message || 'Update failed') } };

  return (
    <Layout>
      <div className="card">
        <h3>Admin - Users</h3>
        <table className="table" style={{marginTop:10}}>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Change</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u._id}>
                <td>{u.name}</td>
                <td className="small">{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <select value={u.role} onChange={e=>changeRole(u._id,e.target.value)}>
                    <option value="advisor">advisor</option>
                    <option value="technician">technician</option>
                    <option value="manager">manager</option>
                    <option value="cashier">cashier</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}