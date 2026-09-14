import {Router} from 'express';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {buildAuthorizeUrl,fetchOAuthProfile,readState} from '../services/oauth.js';

const db=new PrismaClient();
const r=Router();

function adminEmails(){ return new Set(String(process.env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean)); }
function safeUser(user){ return {id:user.id,email:user.email,name:user.name,role:user.role,status:user.status}; }
function tokenFor(user){ return jwt.sign({sub:user.id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:'30d'}); }
function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

r.post('/register',async(req,res)=>{
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    const password=String(req.body?.password||'');
    if(!validEmail(email)) return res.status(400).json({error:'INVALID_EMAIL',message:'올바른 이메일 주소를 입력해주세요.'});
    if(password.length<8) return res.status(400).json({error:'WEAK_PASSWORD',message:'비밀번호는 8자 이상이어야 합니다.'});
    const exists=await db.user.findUnique({where:{email}});
    if(exists) return res.status(409).json({error:'EMAIL_EXISTS',message:'이미 가입된 이메일입니다.'});
    const passwordHash=await bcrypt.hash(password,12);
    const role=adminEmails().has(email)?'ADMIN':'USER';
    const user=await db.user.create({data:{email,passwordHash,role,lastLoginAt:new Date()}});
    res.status(201).json({token:tokenFor(user),user:safeUser(user)});
  }catch(e){ res.status(500).json({error:'REGISTER_FAILED',message:e.message}); }
});

r.post('/login',async(req,res)=>{
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    const password=String(req.body?.password||'');
    const user=await db.user.findUnique({where:{email}});
    if(!user || !user.passwordHash || !(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({error:'INVALID_CREDENTIALS',message:'이메일 또는 비밀번호를 확인해주세요.'});
    if(user.status!=='ACTIVE') return res.status(403).json({error:'ACCOUNT_SUSPENDED',message:'사용이 중지된 계정입니다.'});
    const updated=await db.user.update({where:{id:user.id},data:{lastLoginAt:new Date(),role:adminEmails().has(email)?'ADMIN':user.role}});
    res.json({token:tokenFor(updated),user:safeUser(updated)});
  }catch(e){ res.status(500).json({error:'LOGIN_FAILED',message:e.message}); }
});

r.get('/oauth/:provider/start',(req,res)=>{
  try{
    const redirectUri=String(req.query.redirect_uri||'bodycheck://auth');
    if(!redirectUri.startsWith('bodycheck://')) return res.status(400).json({error:'INVALID_REDIRECT'});
    res.redirect(buildAuthorizeUrl(req.params.provider,redirectUri));
  }catch(e){ res.status(503).json({error:e.message==='OAUTH_NOT_CONFIGURED'?'OAUTH_NOT_CONFIGURED':'OAUTH_START_FAILED',message:e.message}); }
});

r.get('/oauth/:provider/callback',async(req,res)=>{
  let appRedirect='bodycheck://auth';
  try{
    const stateData=readState(String(req.query.state||'')); appRedirect=stateData.appRedirect||appRedirect;
    if(stateData.provider!==req.params.provider) throw new Error('STATE_PROVIDER_MISMATCH');
    const profile=await fetchOAuthProfile(req.params.provider,String(req.query.code||''),String(req.query.state||''));
    if(!profile.email) throw new Error('SNS_EMAIL_REQUIRED');
    const email=profile.email.trim().toLowerCase();
    let identity=await db.authIdentity.findUnique({where:{provider_providerUserId:{provider:req.params.provider,providerUserId:profile.providerUserId}},include:{user:true}});
    let user;
    if(identity){ user=identity.user; }
    else{
      user=await db.user.findUnique({where:{email}});
      if(!user) user=await db.user.create({data:{email,name:profile.name,role:adminEmails().has(email)?'ADMIN':'USER'}});
      await db.authIdentity.create({data:{userId:user.id,provider:req.params.provider,providerUserId:profile.providerUserId,email}});
    }
    if(user.status!=='ACTIVE') throw new Error('ACCOUNT_SUSPENDED');
    user=await db.user.update({where:{id:user.id},data:{lastLoginAt:new Date(),name:user.name||profile.name}});
    const token=tokenFor(user);
    const url=new URL(appRedirect); url.searchParams.set('token',token); url.searchParams.set('provider',req.params.provider);
    res.redirect(url.toString());
  }catch(e){
    const url=new URL(appRedirect); url.searchParams.set('error',e.message||'OAUTH_FAILED'); res.redirect(url.toString());
  }
});

export default r;
