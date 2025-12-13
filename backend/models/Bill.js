import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
  partId: String,
  name: String,
  qty: Number,
  unitPrice: Number,
  total: Number
}, { _id: false });

const BillSchema = new mongoose.Schema({
  jobCard: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', required: true, unique: true },
  parts: [billItemSchema],
  total: { type: Number, default: 0 },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prints: { type: Number, default: 1 },           // how many times bill generated
  lastPrintedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Bill', BillSchema);