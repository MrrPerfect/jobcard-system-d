import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import Layout from '../components/Layout.jsx';

export default function TechnicianJobs(){
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chargesForm, setChargesForm] = useState({}); // { [jobId]: { description, amount } }
  const [editingSummary, setEditingSummary] = useState({}); // { [jobId]: text }

  useEffect(()=>{ load(); }, []);

  const load = async ()=> {
    try {
      setLoading(true);
      const res = await api.get('/jobcards');
      setJobs(res.data || []);
    } catch (err) {
      alert('Load failed');
    } finally { setLoading(false); }
  };

  const update = async (id, payload) => {
    try {
      const res = await api.patch(`/jobcards/${id}/status`, payload);
      setJobs(s => s.map(j => j._id === id ? res.data : j));
    } catch (err) {
      alert(err?.response?.data?.message || 'Update failed');
    }
  };

  // Add service charges (technician or manager)
  const addServiceCharge = async (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    if (!job) return alert('Job not found');
    if (job.status === 'Done') return alert('Cannot add service charge to a completed job');

    const form = chargesForm[jobId] || {};
    const description = (form.description || '').trim();
    const amount = Number(form.amount || 0);
    if (!description || amount <= 0) return alert('Provide description and positive amount');
    try {
      const res = await api.patch(`/jobcards/${jobId}/service-charges`, { charges: [{ description, amount }] });
      setJobs(s => s.map(j => j._id === jobId ? res.data : j));
      setChargesForm(cf => ({ ...cf, [jobId]: { description: '', amount: '' } }));
      alert('Charge added');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add charge');
    }
  };

  // Save summary without completing
  const saveSummary = async (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    if (!job) return alert('Job not found');
    if (job.status === 'Done') return alert('Cannot edit summary for a completed job');

    const text = (editingSummary[jobId] || '').trim();
    try {
      const res = await api.patch(`/jobcards/${jobId}`, { finalSummary: text });
      setJobs(s => s.map(j => j._id === jobId ? res.data : j));
      setEditingSummary(e => ({ ...e, [jobId]: undefined }));
      alert('Summary saved');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save summary');
    }
  };

  // Complete job: require summary and confirmation, lock further edits/charges
  const completeJob = async (jobId) => {
    const job = jobs.find(j => j._id === jobId);
    if (!job) return alert('Job not found');
    const text = (editingSummary[jobId] ?? job.finalSummary ?? '').trim();
    if (!text) return alert('Enter final summary before completing the job');

    if (!confirm('Mark job as DONE? This will lock the summary and prevent adding service charges.')) return;

    try {
      // save final summary first
      await api.patch(`/jobcards/${jobId}`, { finalSummary: text });
      // then set status to Done
      const res = await api.patch(`/jobcards/${jobId}/status`, { status: 'Done' });
      setJobs(s => s.map(j => j._id === jobId ? res.data : j));
      alert('Job completed');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to complete job');
    }
  };

  return (
    <Layout>
      <div className="card">
        <h3>My Jobs</h3>
        {loading && <div className="small">Loading…</div>}
        <div style={{display:'grid',gap:12,marginTop:10}}>
          {jobs.map(j => (
            <div key={j._id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
              <div style={{flex:1}}>
                <div><strong>{j.vehicleNumber}</strong> — <span className="small">{j.customerName}</span></div>
                <div className="small" style={{marginTop:6}}>{j.reportedIssue}</div>
                <div style={{marginTop:6}} className="small">Status: <strong>{j.status}</strong></div>

                <div style={{marginTop:8}}>
                  <div className="small">Service charges:</div>
                  <ul>
                    {(j.serviceCharges || []).map((s,i)=>(
                      <li key={i}>{s.description} — Rs. {s.amount} <span className="small">({s.addedBy?.name || 'by user'})</span></li>
                    ))}
                    {(j.serviceCharges || []).length === 0 && <li className="small">No service charges</li>}
                  </ul>
                </div>

                <div style={{marginTop:8}}>
                  <div className="small">Final summary:</div>
                  {j.status === 'Done' ? (
                    <div className="card small" style={{padding:8,background:'#fafafa'}}>{j.finalSummary || <em>No summary provided</em>}</div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      <textarea
                        className="input"
                        value={editingSummary[j._id] ?? j.finalSummary ?? ''}
                        onChange={e=>setEditingSummary(es=>({...es,[j._id]: e.target.value}))}
                        placeholder="Enter final summary (required before completing)"
                        style={{minHeight:96}}
                      />
                      <div style={{display:'flex',gap:8}}>
                        <button className="btn" onClick={()=>saveSummary(j._id)}>Save Summary</button>
                        <button className="btn ghost" onClick={()=>setEditingSummary(es=>({...es,[j._id]: j.finalSummary || ''}))}>Reset</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{width:300,display:'flex',flexDirection:'column',gap:8}}>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {j.status === 'Assigned' && <button className="btn" onClick={()=>update(j._id,{status:'In Progress'})}>Start</button>}
                  {j.status === 'In Progress' && (
                    <button
                      className="btn"
                      onClick={()=>completeJob(j._id)}
                      disabled={!( (editingSummary[j._id] ?? j.finalSummary ?? '').trim().length > 0 )}
                      title={!((editingSummary[j._id] ?? j.finalSummary ?? '').trim().length>0) ? 'Enter final summary before completing' : 'Complete job'}
                    >
                      Complete
                    </button>
                  )}
                </div>

                <div style={{borderTop:'1px solid #eee',paddingTop:8,display:'flex',flexDirection:'column',gap:6}}>
                  <div className="small">Add Service Charge</div>
                  <input
                    className="input"
                    placeholder="Description"
                    value={(chargesForm[j._id] || {}).description || ''}
                    onChange={e=>setChargesForm(cf=>({...cf,[j._id]:{...(cf[j._id]||{}), description:e.target.value}}))}
                    disabled={j.status === 'Done'}
                  />
                  <input
                    className="input"
                    placeholder="Amount"
                    type="number"
                    value={(chargesForm[j._id] || {}).amount || ''}
                    onChange={e=>setChargesForm(cf=>({...cf,[j._id]:{...(cf[j._id]||{}), amount:e.target.value}}))}
                    disabled={j.status === 'Done'}
                  />
                  <button className="btn" onClick={()=>addServiceCharge(j._id)} disabled={j.status === 'Done'}>Add Charge</button>
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && <div className="small">No jobs assigned.</div>}
        </div>
      </div>
    </Layout>
  );
}