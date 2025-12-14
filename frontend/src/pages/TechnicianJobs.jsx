import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Layout from "../components/Layout.jsx";

const STATUS_FILTERS = ["ALL", "Assigned", "In Progress", "Done"];

export default function TechnicianJobs() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const nav = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const r = await api.get("/jobcards");
      setJobs(r.data || []);
    } catch (e) {
      console.warn(e);
      alert("Failed to load jobs");
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      !query ||
      (j.vehicleNumber || "").toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || j.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const startJob = async (e, job) => {
    e.stopPropagation();
    if (!window.confirm(`Start job for ${job.vehicleNumber}?`)) return;

    try {
      await api.put(`/technician/jobs/${job._id}/start`);
      setJobs((prev) =>
        prev.map((j) =>
          j._id === job._id ? { ...j, status: "In Progress" } : j,
        ),
      );
    } catch {
      alert("Failed to start job");
    }
  };

  return (
    <Layout>
      <div className="card">
        <h3>My Jobs</h3>

        {/* Top controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <input
            className="input"
            placeholder="Search by vehicle number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              className={`btn ${statusFilter === st ? "" : "ghost"}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Single table */}
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle / Customer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredJobs.map((job) => (
              <tr
                key={job._id}
                onClick={() => nav(`/technician/jobs/${job._id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <strong>{job.vehicleNumber}</strong>
                  <div className="small">{job.customerName}</div>
                </td>

                <td>
                  <span className={`badge status-${job.status?.toLowerCase()}`}>
                    {job.status}
                  </span>
                </td>

                <td>
                  <button
                    className="btn small"
                    disabled={job.status !== "Assigned"}
                    onClick={(e) => startJob(e, job)}
                  >
                    Start
                  </button>
                </td>
              </tr>
            ))}

            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan="3" className="small">
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
