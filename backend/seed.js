import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();
const MONGO = process.env.MONGO || 'mongodb://127.0.0.1:27017/jobcard';

const users = [
  { name:'Advisor', email:'advisor@example.com', role:'advisor', password:'pass123' },
  { name:'Technician', email:'tech@example.com', role:'technician', password:'pass123' },
  { name:'Manager', email:'manager@example.com', role:'manager', password:'pass123' },
  { name:'Cashier', email:'cashier@example.com', role:'cashier', password:'pass123' }
];

async function run() {
  await mongoose.connect(MONGO);
  await User.deleteMany({});
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, email: u.email, role: u.role, password: hashed });
    console.log('created', u.email, u.role);
  }
  console.log('Done');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });