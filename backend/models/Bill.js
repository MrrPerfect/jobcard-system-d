import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
  {
    partId: String, // null for service charges
    name: String,
    qty: Number,
    unitPrice: Number,
    total: Number,
  },
  { _id: false },
);

const BillSchema = new mongoose.Schema(
  {
    jobCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
      required: true,
      unique: true,
    },
    items: [billItemSchema],
    total: { type: Number, default: 0 },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastPrintedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Bill", BillSchema);
