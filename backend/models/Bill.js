import mongoose from 'mongoose';

const partSchema = new mongoose.Schema({
  partId: String,
  name: String,
  qty: Number,
  unitPrice: Number,
  total: Number
});

const billSchema = new mongoose.Schema({
  jobCard: { type: mongoose.Schema.Types.ObjectId, ref: 'JobCard', required: true },
  parts: [partSchema],
  total: { type: Number, required: true },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);