import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';

const db = new PrismaClient();

export function auth(req,res,next){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');
  if(!token) return res.status(401).json({error:'AUTH_REQUIRED'});
  try{
    req.user=jwt.verify(token,process.env.JWT_SECRET);
    next();
  }catch{
    return res.status(401).json({error:'INVALID_TOKEN'});
  }
}

export async function adminOnly(req,res,next){
  try{
    const user=await db.user.findUnique({where:{id:req.user.sub},select:{role:true,status:true}});
    if(!user || user.status!=='ACTIVE') return res.status(403).json({error:'ACCOUNT_DISABLED'});
    if(user.role!=='ADMIN') return res.status(403).json({error:'ADMIN_REQUIRED'});
    next();
  }catch(e){
    res.status(500).json({error:'ADMIN_CHECK_FAILED',message:e.message});
  }
}
