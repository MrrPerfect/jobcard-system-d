
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import jobCardRoutes from './routes/jobcards.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/api/auth', authRoutes);
app.use('/api/jobcards',jobCardRoutes);


app.get('/', (req,res)=> res.send("Backend running Phase 1"));

app.listen(5000, ()=> console.log("Server running on 5000"));
