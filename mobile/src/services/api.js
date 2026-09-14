import {getToken} from './auth';

export const API_BASE=process.env.EXPO_PUBLIC_API_BASE;

function baseUrl(){
  if(!API_BASE) throw new Error('EXPO_PUBLIC_API_BASE가 설정되지 않았습니다.');
  return API_BASE.replace(/\/+$/,'');
}

function friendlyNetworkError(e){
  const msg=String(e?.message||e||'');
  const low=msg.toLowerCase();
  if(e?.name==='AbortError' || low.includes('canceled') || low.includes('cancelled')){
    return new Error('서버 준비 시간이 길어 요청이 중단되었습니다. 다시 한 번 시도해주세요.');
  }
  if(low.includes('network request failed') || low.includes('fetch failed')){
    return new Error('서버에 연결하지 못했습니다. 인터넷 연결 또는 서버 상태를 확인해주세요.');
  }
  return e instanceof Error ? e : new Error(msg);
}

async function rawFetch(path,options={},timeoutMs=45000,withAuth=true){
  const token=withAuth ? await getToken() : null;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const res=await fetch(`${baseUrl()}${path}`,{
      ...options,
      signal:controller.signal,
      headers:{
        'Content-Type':'application/json',
        ...(token?{Authorization:`Bearer ${token}`}:{ }),
        ...(options.headers||{})
      }
    });
    const text=await res.text();
    let data={};
    try{data=text?JSON.parse(text):{}}catch{data={message:text}}
    if(!res.ok) throw new Error(data?.message||data?.error||`HTTP ${res.status}`);
    return data;
  }catch(e){
    throw friendlyNetworkError(e);
  }finally{
    clearTimeout(timer);
  }
}

// Render free instances may need time to wake up after inactivity.
// Wake the server BEFORE sending a non-idempotent register request,
// so we never automatically retry POST /register and accidentally duplicate it.
async function wakeServer(){
  return rawFetch('/api/health',{method:'GET'},90000,false);
}

async function authRequest(path,email,password){
  await wakeServer();
  return rawFetch(path,{
    method:'POST',
    body:JSON.stringify({email,password})
  },45000,false);
}

export const api={
  wakeServer,
  register:(email,password)=>authRequest('/api/auth/register',email,password),
  login:(email,password)=>authRequest('/api/auth/login',email,password),
  getProfile:()=>rawFetch('/api/me'),
  saveHealthRecord:(payload)=>rawFetch('/api/health-records',{method:'POST',body:JSON.stringify(payload)}),
  getHealthRecords:()=>rawFetch('/api/health-records'),
  searchHospitals:(payload)=>rawFetch('/api/hospitals/search',{method:'POST',body:JSON.stringify(payload)},60000),
  adminUsers:(q='')=>rawFetch(`/api/admin/users?q=${encodeURIComponent(q)}`),
  updateUser:(id,payload)=>rawFetch(`/api/admin/users/${id}`,{method:'PATCH',body:JSON.stringify(payload)})
};
