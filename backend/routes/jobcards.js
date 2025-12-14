import express from "express";
import JobCard from "../models/JobCard.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/* =========================================================
   CREATE JOBCARD (Advisor)
========================================================= */
router.post("/", requireAuth, requireRole("advisor"), async (req, res) => {
  try {
    const job = await JobCard.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* =========================================================
   LIST JOBCARDS (Role-based)
========================================================= */
router.get("/", requireAuth, async (req, res) => {
  try {
    const role = req.user.role;

    if (role === "manager")
      return res.json(await JobCard.find().populate("assignedTo createdBy"));

    if (role === "advisor")
      return res.json(await JobCard.find({ createdBy: req.user._id }));

    if (role === "technician")
      return res.json(
        await JobCard.find({ assignedTo: req.user._id }).populate(
          "assignedTo createdBy",
        ),
      );

    if (role === "cashier")
      return res.json(await JobCard.find({ status: "Done" }));

    res.json([]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   GET SINGLE JOBCARD
========================================================= */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const job = await JobCard.findById(req.params.id).populate(
      "assignedTo createdBy",
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   UPDATE GENERIC FIELDS (summary, partsUsed, serviceCharges)
   <-- THIS FIXES YOUR 404
========================================================= */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const job = await JobCard.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   UPDATE STATUS (Technician / Manager)
========================================================= */
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const allowed = {
      Created: ["Assigned"],
      Assigned: ["In Progress"],
      "In Progress": ["Done"],
      Done: [],
    };

    if (
      status &&
      status !== job.status &&
      !allowed[job.status].includes(status) &&
      req.user.role !== "manager"
    ) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    if (status) job.status = status;
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   ASSIGN TECHNICIAN (Advisor / Manager)
========================================================= */
router.patch("/:id/assign", requireAuth, async (req, res) => {
  try {
    if (!["advisor", "manager"].includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });

    const { technicianId } = req.body;
    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.assignedTo = technicianId;
    job.assignedBy = req.user._id; // the advisor/manager doing the assignment
    job.assignedAt = new Date();
    job.status = "Assigned";
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   ADD SERVICE CHARGES (Technician / Manager)
========================================================= */
router.patch("/:id/service-charges", requireAuth, async (req, res) => {
  try {
    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only assigned technician or manager
    if (
      req.user.role === "technician" &&
      (!job.assignedTo || job.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Not your job" });
    }

    if (!["technician", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { charges } = req.body;
    if (!Array.isArray(charges)) {
      return res.status(400).json({ message: "charges array required" });
    }

    const mappedCharges = charges.map((c) => ({
      description: c.description || "",
      amount: Number(c.amount) || 0,
      addedBy: req.user._id,
      addedAt: new Date(),
    }));

    job.serviceCharges = [...(job.serviceCharges || []), ...mappedCharges];
    await job.save();

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   ADD USED PART (Technician)
========================================================= */
router.patch("/:id/parts", requireAuth, async (req, res) => {
  try {
    if (!["technician", "manager"].includes(req.user.role))
      return res.status(403).json({ message: "Not allowed" });

    const { partId, name, qty, reason, priceAtUse } = req.body;
    if (!partId || !qty)
      return res.status(400).json({ message: "partId & qty required" });

    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.partsUsed = job.partsUsed || [];
    job.partsUsed.push({
      partId,
      name,
      qty: Number(qty),
      reason: reason || "",
      priceAtUse: Number(priceAtUse) || 0,
      addedBy: req.user._id,
      addedAt: new Date(),
    });

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * MARK JOB AS CRITICAL
 * Technicians can mark a job as critical and optionally add a note.
 */
router.patch("/:id/critical", requireAuth, async (req, res) => {
  try {
    const { note } = req.body; // optional description of the issue
    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only technician or manager/advisor can mark critical
    if (!["technician", "manager", "advisor"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Not authorized to mark critical" });
    }

    job.critical = true;
    if (note) job.criticalNote = note; // optional field
    await job.save();

    // TODO: notify service advisor (e.g., via email or websocket)
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * NOTIFY SERVICE ADVISOR
 * Triggered when a critical issue is marked
 */
/**
 * NOTIFY SERVICE ADVISOR
 */
router.post("/:id/notify-advisor", requireAuth, async (req, res) => {
  try {
    const job = await JobCard.findById(req.params.id).populate("createdBy");
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (req.user.role !== "technician") {
      return res
        .status(403)
        .json({ message: "Only technician can notify advisor" });
    }

    const advisor = job.createdBy;
    if (!advisor)
      return res.status(400).json({ message: "No advisor assigned" });

    console.log(
      `Notification: Job ${job._id} marked critical by technician ${req.user._id}. Notify advisor ${advisor._id}`,
    );

    res.json({ message: "Advisor notified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
