import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import jobcardRoutes from './routes/jobcards.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobcards', jobcardRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO || 'mongodb://127.0.0.1:27017/jobcard';

mongoose.connect(MONGO, { })
  .then(()=> {
    app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('DB connect error', err);
    process.exit(1);
  });