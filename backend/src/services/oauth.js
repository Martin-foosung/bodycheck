import jwt from 'jsonwebtoken';

const apiBase=()=>String(process.env.PUBLIC_API_BASE||'').replace(/\/+$/,'');

const providers={
  google:{
    authorize:'https://accounts.google.com/o/oauth2/v2/auth',
    token:'https://oauth2.googleapis.com/token',
    clientId:()=>process.env.GOOGLE_CLIENT_ID,
    clientSecret:()=>process.env.GOOGLE_CLIENT_SECRET,
    scope:'openid email profile'
  },
  kakao:{
    authorize:'https://kauth.kakao.com/oauth/authorize',
    token:'https://kauth.kakao.com/oauth/token',
    clientId:()=>process.env.KAKAO_REST_API_KEY,
    clientSecret:()=>process.env.KAKAO_CLIENT_SECRET,
    scope:'account_email profile_nickname'
  },
  naver:{
    authorize:'https://nid.naver.com/oauth2.0/authorize',
    token:'https://nid.naver.com/oauth2.0/token',
    clientId:()=>process.env.NAVER_CLIENT_ID,
    clientSecret:()=>process.env.NAVER_CLIENT_SECRET,
    scope:''
  }
};

export function providerConfig(provider){ return providers[provider]; }
export function callbackUrl(provider){ return `${apiBase()}/api/auth/oauth/${provider}/callback`; }

export function buildAuthorizeUrl(provider,appRedirect){
  const p=providerConfig(provider);
  if(!p || !p.clientId()) throw new Error('OAUTH_NOT_CONFIGURED');
  const state=jwt.sign({provider,appRedirect},process.env.JWT_SECRET,{expiresIn:'10m'});
  const q=new URLSearchParams({
    response_type:'code',client_id:p.clientId(),redirect_uri:callbackUrl(provider),state
  });
  if(p.scope) q.set('scope',p.scope);
  return `${p.authorize}?${q}`;
}

export function readState(state){ return jwt.verify(state,process.env.JWT_SECRET); }

async function postForm(url,data,headers={}){
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',...headers},body:new URLSearchParams(data)});
  const body=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(body.error_description||body.error||`OAUTH_TOKEN_HTTP_${res.status}`);
  return body;
}

export async function fetchOAuthProfile(provider,code,state){
  const p=providerConfig(provider);
  if(!p) throw new Error('UNSUPPORTED_PROVIDER');
  const redirectUri=callbackUrl(provider);
  let token;
  if(provider==='naver'){
    const q=new URLSearchParams({grant_type:'authorization_code',client_id:p.clientId(),client_secret:p.clientSecret(),code,state});
    const res=await fetch(`${p.token}?${q}`); token=await res.json();
    if(!res.ok || token.error) throw new Error(token.error_description||token.error||'NAVER_TOKEN_FAILED');
    const profileRes=await fetch('https://openapi.naver.com/v1/nid/me',{headers:{Authorization:`Bearer ${token.access_token}`}});
    const data=await profileRes.json();
    if(!profileRes.ok || data.resultcode!=='00') throw new Error(data.message||'NAVER_PROFILE_FAILED');
    return {providerUserId:String(data.response.id),email:data.response.email||null,name:data.response.name||data.response.nickname||null};
  }
  token=await postForm(p.token,{
    grant_type:'authorization_code',client_id:p.clientId(),client_secret:p.clientSecret()||'',code,redirect_uri:redirectUri
  });
  if(provider==='google'){
    const res=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${token.access_token}`}});
    const data=await res.json(); if(!res.ok) throw new Error('GOOGLE_PROFILE_FAILED');
    return {providerUserId:String(data.sub),email:data.email||null,name:data.name||null};
  }
  const res=await fetch('https://kapi.kakao.com/v2/user/me',{headers:{Authorization:`Bearer ${token.access_token}`}});
  const data=await res.json(); if(!res.ok) throw new Error('KAKAO_PROFILE_FAILED');
  return {providerUserId:String(data.id),email:data.kakao_account?.email||null,name:data.kakao_account?.profile?.nickname||null};
}
