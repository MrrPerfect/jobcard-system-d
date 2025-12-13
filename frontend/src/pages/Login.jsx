import React, { useState } from 'react';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('name', res.data.user.name);
      if (res.data.user.role === 'advisor') nav('/jobcards/new');
      else if (res.data.user.role === 'technician') nav('/technician');
      else nav('/dashboard');
    } catch (err) {
      alert(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>Login</h3>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
      <button type="submit">Login</button>
    </form>
  );
}