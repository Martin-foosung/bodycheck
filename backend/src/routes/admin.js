import {Router} from 'express';
import {PrismaClient} from '@prisma/client';
import {auth,adminOnly} from '../middleware/auth.js';

const db=new PrismaClient();
const r=Router();
r.use(auth,adminOnly);

r.get('/users',async(req,res)=>{
  const q=String(req.query.q||'').trim();
  const where=q?{OR:[{email:{contains:q,mode:'insensitive'}},{name:{contains:q,mode:'insensitive'}}]}:{};
  const users=await db.user.findMany({where,orderBy:{createdAt:'desc'},take:200,select:{id:true,email:true,name:true,role:true,status:true,lastLoginAt:true,createdAt:true,_count:{select:{records:true,identities:true}}}});
  res.json(users);
});

r.patch('/users/:id',async(req,res)=>{
  const data={};
  if(['USER','ADMIN'].includes(req.body?.role)) data.role=req.body.role;
  if(['ACTIVE','SUSPENDED'].includes(req.body?.status)) data.status=req.body.status;
  if(req.params.id===req.user.sub && data.status==='SUSPENDED') return res.status(400).json({error:'CANNOT_SUSPEND_SELF'});
  const user=await db.user.update({where:{id:req.params.id},data,select:{id:true,email:true,name:true,role:true,status:true,lastLoginAt:true,createdAt:true}});
  res.json(user);
});

export default r;
