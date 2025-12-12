
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const users = [
  { name:"Service Advisor", email:"advisor@test.com", role:"advisor" },
  { name:"Technician", email:"tech@test.com", role:"technician" },
  { name:"Cashier", email:"cashier@test.com", role:"cashier" },
  { name:"Manager", email:"manager@test.com", role:"manager" }
];

for(const u of users){
  const hashed = await bcrypt.hash("password",10);
  await User.create({ ...u, password: hashed });
}

console.log("Seeded users.");
process.exit();
