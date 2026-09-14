import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import healthRecords from './routes/healthRecords.js';
import hospitals from './routes/hospitals.js';
import {auth} from './middleware/auth.js';

const app=express();
const origin=process.env.CORS_ORIGIN||'*';
app.use(cors({origin:origin==='*'?true:origin.split(',').map(x=>x.trim())}));
app.use(express.json({limit:'1mb'}));

app.get('/api/health',(req,res)=>res.json({ok:true,version:'2.3.0',time:new Date().toISOString()}));
app.use('/api/auth',authRoutes);
app.get('/api/me',auth,(req,res)=>res.json({id:req.user.sub,email:req.user.email}));
app.use('/api/health-records',healthRecords);
app.use('/api/hospitals',hospitals);

const port=Number(process.env.PORT||8787);
app.listen(port,'0.0.0.0',()=>console.log(`BodyCheck API listening on :${port}`));
