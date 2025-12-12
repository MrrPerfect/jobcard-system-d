
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');

  const login = async ()=>{
    const res = await fetch('http://localhost:5000/api/auth/login',{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    setMsg(JSON.stringify(data));
  };

  return (
    <div>
      <h2>Login Phase 1</h2>
      <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <pre>{msg}</pre>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
