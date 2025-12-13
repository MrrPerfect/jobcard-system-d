import mongoose from 'mongoose';

const jobCardSchema = new mongoose.Schema({
  vehicleType: { type: String, enum: ['2W','4W'], required: true },
  vehicleNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: String,
  reportedIssue: String,
  status: { type: String, enum: ['Created','Assigned','In Progress','Done'], default: 'Created' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  critical: { type: Boolean, default: false },
  finalSummary: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('JobCard', jobCardSchema);