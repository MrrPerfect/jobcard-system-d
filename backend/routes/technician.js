import express from "express";
import JobCard from "../models/JobCard.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/* =========================================================
   GET JOBS FOR LOGGED-IN TECHNICIAN
========================================================= */
router.get(
  "/jobs",
  requireAuth,
  requireRole("technician"),
  async (req, res) => {
    try {
      const jobs = await JobCard.find({
        assignedTo: req.user._id,
      })
        .populate("createdBy assignedTo")
        .sort({ createdAt: -1 });

      res.json(jobs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

/* =========================================================
   START JOB (Assigned → In Progress)
========================================================= */
router.put(
  "/jobs/:id/start",
  requireAuth,
  requireRole("technician"),
  async (req, res) => {
    try {
      const job = await JobCard.findById(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found" });

      // must be assigned to this technician
      if (
        !job.assignedTo ||
        job.assignedTo.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "This job is not assigned to you" });
      }

      if (job.status !== "Assigned") {
        return res
          .status(400)
          .json({ message: "Job must be Assigned to start" });
      }

      job.status = "In Progress";
      await job.save();

      res.json(job);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

/* =========================================================
   COMPLETE JOB (In Progress → Done)
========================================================= */
router.put(
  "/jobs/:id/complete",
  requireAuth,
  requireRole("technician"),
  async (req, res) => {
    try {
      const { technicianSummary } = req.body;

      const job = await JobCard.findById(req.params.id);
      if (!job) return res.status(404).json({ message: "Job not found" });

      if (
        !job.assignedTo ||
        job.assignedTo.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "This job is not assigned to you" });
      }

      if (job.status !== "In Progress") {
        return res
          .status(400)
          .json({ message: "Job must be In Progress to complete" });
      }

      job.status = "Done";
      job.finalSummary = technicianSummary || "";
      await job.save();

      res.json(job);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

export default router;
