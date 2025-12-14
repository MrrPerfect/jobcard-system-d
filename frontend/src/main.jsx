import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import JobCardForm from "./pages/JobCardForm.jsx";
import JobCardList from "./pages/JobCardList.jsx";
import TechnicianJobs from "./pages/TechnicianJobs.jsx";
import ManagerKanban from "./pages/ManagerKanban.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Cashier from "./pages/Cashier.jsx";
import WorkerDetail from "./pages/WorkerDetail.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";

function Protected({ children, roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (roles && roles.length && !roles.includes(role))
    return <Navigate to="/login" replace />;
  return children;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/jobcards"
        element={
          <Protected>
            <JobCardList />
          </Protected>
        }
      />
      <Route
        path="/jobcards/new"
        element={
          <Protected roles={["advisor"]}>
            <JobCardForm />
          </Protected>
        }
      />
      <Route
        path="/jobcards/:id"
        element={
          <Protected>
            <JobCardForm />
          </Protected>
        }
      />
      <Route
        path="/technician"
        element={
          <Protected roles={["technician"]}>
            <TechnicianJobs />
          </Protected>
        }
      />
      <Route
        path="/manager"
        element={
          <Protected roles={["manager"]}>
            <ManagerKanban />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected roles={["manager"]}>
            <AdminPanel />
          </Protected>
        }
      />
      <Route
        path="/cashier"
        element={
          <Protected roles={["cashier"]}>
            <Cashier />
          </Protected>
        }
      />
      <Route
        path="/workers/:id"
        element={
          <Protected roles={["manager", "admin"]}>
            <WorkerDetail />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route
        path="/technician/jobs/:id"
        element={
          <Protected roles={["technician"]}>
            <ServiceDetail />
          </Protected>
        }
      />
    </Routes>
  </BrowserRouter>,
);
