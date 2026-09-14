import {getToken} from './auth';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;

function baseUrl(){
  if(!API_BASE) throw new Error('EXPO_PUBLIC_API_BASE가 설정되지 않았습니다.');
  return API_BASE.replace(/\/+$/,'');
}

async function request(path,options={}){
  const token=await getToken();
  const res=await fetch(`${baseUrl()}${path}`,{
    ...options,
    headers:{
      'Content-Type':'application/json',
      ...(token?{Authorization:`Bearer ${token}`}:{ }),
      ...(options.headers||{})
    }
  });
  const text=await res.text();
  let data={}; try{data=text?JSON.parse(text):{}}catch{data={message:text}}
  if(!res.ok) throw new Error(data?.message||data?.error||'API error');
  return data;
}

export const api={
  register:(email,password)=>request('/api/auth/register',{method:'POST',body:JSON.stringify({email,password})}),
  login:(email,password)=>request('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  getProfile:()=>request('/api/me'),
  saveHealthRecord:(payload)=>request('/api/health-records',{method:'POST',body:JSON.stringify(payload)}),
  getHealthRecords:()=>request('/api/health-records'),
  searchHospitals:(payload)=>request('/api/hospitals/search',{method:'POST',body:JSON.stringify(payload)})
};
