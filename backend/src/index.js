import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import healthRecords from './routes/healthRecords.js';
import hospitals from './routes/hospitals.js';
import {auth} from './middleware/auth.js';
import {PrismaClient} from '@prisma/client';

const db=new PrismaClient();
const app=express();
const origin=process.env.CORS_ORIGIN||'*';
app.use(cors({origin:origin==='*'?true:origin.split(',').map(x=>x.trim())}));
app.use(express.json({limit:'1mb'}));

app.get('/api/health',(req,res)=>res.json({ok:true,version:'2.4.0',time:new Date().toISOString()}));
app.use('/api/auth',authRoutes);
app.get('/api/me',auth,async(req,res)=>{
  const user=await db.user.findUnique({where:{id:req.user.sub},select:{id:true,email:true,name:true,role:true,status:true}});
  if(!user) return res.status(404).json({error:'USER_NOT_FOUND'});
  res.json(user);
});
app.use('/api/admin',adminRoutes);
app.use('/api/health-records',healthRecords);
app.use('/api/hospitals',hospitals);

const port=Number(process.env.PORT||8787);
app.listen(port,'0.0.0.0',()=>console.log(`BodyCheck API v2.4 listening on :${port}`));
