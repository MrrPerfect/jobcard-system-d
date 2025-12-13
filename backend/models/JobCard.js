import mongoose from 'mongoose';

const JobCardSchema = new mongoose.Schema({
  vehicleType: { type: String, enum: ['2W', '4W'], required: true },
  vehicleNumber: String,
  customerName: String,
  customerPhone: String,
  reportedIssue: String,
  status: {
    type: String,
    enum: ['CREATED', 'IN_PROGRESS', 'DONE'],
    default: 'CREATED'
  },
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model('JobCard', JobCardSchema);
