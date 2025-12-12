
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['advisor','technician','cashier','manager'] }
});

export default mongoose.model('User', userSchema);
