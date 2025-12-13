import { useState } from 'react';
import api from '../services/api';

export default function JobCardForm() {
  const [form, setForm] = useState({
    vehicleType: '2W',
    vehicleNumber: '',
    customerName: '',
    customerPhone: '',
    reportedIssue: ''
  });

  const submit = async () => {
    await api.post('/jobcards', form);
    alert('Job Card Created');
    window.location.reload();
  };

  return (
    <div>
      <h3>Create Job Card</h3>

      <select onChange={e => setForm({...form, vehicleType: e.target.value})}>
        <option value="2W">2 Wheeler</option>
        <option value="4W">4 Wheeler</option>
      </select><br/>

      <input placeholder="Vehicle Number"
        onChange={e=>setForm({...form, vehicleNumber:e.target.value})} /><br/>

      <input placeholder="Customer Name"
        onChange={e=>setForm({...form, customerName:e.target.value})} /><br/>

      <input placeholder="Customer Phone"
        onChange={e=>setForm({...form, customerPhone:e.target.value})} /><br/>

      <textarea placeholder="Reported Issue"
        onChange={e=>setForm({...form, reportedIssue:e.target.value})} /><br/>

      <button onClick={submit}>Create</button>
    </div>
  );
}
