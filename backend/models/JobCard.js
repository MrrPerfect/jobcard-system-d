import mongoose from "mongoose";

const chargeSchema = new mongoose.Schema(
  {
    description: String,
    amount: { type: Number, default: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const assignHistorySchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false },
);

const partUsedSchema = new mongoose.Schema(
  {
    partId: String, // inventory code / SKU
    name: String,
    qty: { type: Number, required: true },
    priceAtUse: { type: Number, required: true }, // snapshot price
    reason: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const jobCardSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, enum: ["2W", "4W"], required: true },
    vehicleNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: String,
    reportedIssue: String,
    status: {
      type: String,
      enum: ["Created", "Assigned", "In Progress", "Done"],
      default: "Created",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAt: Date,
    assignHistory: [assignHistorySchema],
    partsUsed: [partUsedSchema],
    serviceCharges: [chargeSchema],
    critical: { type: Boolean, default: false },
    criticalNote: String,
    finalSummary: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("JobCard", jobCardSchema);
