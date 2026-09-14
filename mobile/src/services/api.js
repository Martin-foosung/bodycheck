import {getToken} from './auth';
export const API_BASE=process.env.EXPO_PUBLIC_API_BASE;

function baseUrl(){
  if(!API_BASE) throw new Error('EXPO_PUBLIC_API_BASE가 설정되지 않았습니다.');
  return API_BASE.replace(/\/+$/,'');
}

async function request(path,options={},timeoutMs=15000){
  const token=await getToken();
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const res=await fetch(`${baseUrl()}${path}`,{
      ...options,signal:controller.signal,
      headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...(options.headers||{})}
    });
    const text=await res.text();
    let data={}; try{data=text?JSON.parse(text):{}}catch{data={message:text}}
    if(!res.ok) throw new Error(data?.message||data?.error||`HTTP ${res.status}`);
    return data;
  }catch(e){
    if(e.name==='AbortError') throw new Error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.');
    throw e;
  }finally{clearTimeout(timer)}
}

export const api={
  register:(email,password)=>request('/api/auth/register',{method:'POST',body:JSON.stringify({email,password})}),
  login:(email,password)=>request('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  getProfile:()=>request('/api/me'),
  saveHealthRecord:(payload)=>request('/api/health-records',{method:'POST',body:JSON.stringify(payload)}),
  getHealthRecords:()=>request('/api/health-records'),
  searchHospitals:(payload)=>request('/api/hospitals/search',{method:'POST',body:JSON.stringify(payload)}),
  adminUsers:(q='')=>request(`/api/admin/users?q=${encodeURIComponent(q)}`),
  updateUser:(id,payload)=>request(`/api/admin/users/${id}`,{method:'PATCH',body:JSON.stringify(payload)})
};
