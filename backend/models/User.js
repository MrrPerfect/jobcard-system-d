import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["advisor", "technician", "manager", "cashier"],
      required: true,
    },
    phone: String,
    address: String,
    approved: { type: Boolean, default: false }, // admin approves registrations
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
