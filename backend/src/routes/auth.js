import {Router} from 'express';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const db = new PrismaClient();
const r = Router();

function tokenFor(user){
  return jwt.sign(
    {sub:user.id,email:user.email},
    process.env.JWT_SECRET,
    {expiresIn:'30d'}
  );
}

r.post('/register', async(req,res)=>{
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    const password=String(req.body?.password||'');
    if(!email || password.length<8) return res.status(400).json({error:'INVALID_INPUT'});
    const exists=await db.user.findUnique({where:{email}});
    if(exists) return res.status(409).json({error:'EMAIL_EXISTS'});
    const passwordHash=await bcrypt.hash(password,12);
    const user=await db.user.create({data:{email,passwordHash}});
    res.status(201).json({token:tokenFor(user),user:{id:user.id,email:user.email}});
  }catch(e){res.status(500).json({error:'REGISTER_FAILED',message:e.message})}
});

r.post('/login', async(req,res)=>{
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    const password=String(req.body?.password||'');
    const user=await db.user.findUnique({where:{email}});
    if(!user || !(await bcrypt.compare(password,user.passwordHash)))
      return res.status(401).json({error:'INVALID_CREDENTIALS'});
    res.json({token:tokenFor(user),user:{id:user.id,email:user.email}});
  }catch(e){res.status(500).json({error:'LOGIN_FAILED',message:e.message})}
});

export default r;
