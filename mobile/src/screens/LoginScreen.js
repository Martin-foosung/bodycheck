import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,Alert,ActivityIndicator} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import {api,API_BASE} from '../services/api';
import {setToken} from '../services/auth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({onLoggedIn}){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [mode,setMode]=useState('login'); const [loading,setLoading]=useState(false); const [socialLoading,setSocialLoading]=useState('');
  const submit=async()=>{
    if(!email.trim() || !password){Alert.alert('입력 확인','이메일과 비밀번호를 입력해주세요.');return}
    if(mode==='register' && password.length<8){Alert.alert('비밀번호','8자 이상으로 입력해주세요.');return}
    setLoading(true);
    try{
      const data=mode==='login'?await api.login(email,password):await api.register(email,password);
      await setToken(data.token); onLoggedIn?.(data.user);
    }catch(e){Alert.alert(mode==='login'?'로그인 실패':'회원가입 실패',e.message)}
    finally{setLoading(false)}
  };
  const social=async(provider)=>{
    if(!API_BASE){Alert.alert('설정 오류','API 서버 주소가 설정되지 않았습니다.');return}
    setSocialLoading(provider);
    try{
      const redirect='bodycheck://auth';
      const authUrl=`${API_BASE.replace(/\/+$/,'')}/api/auth/oauth/${provider}/start?redirect_uri=${encodeURIComponent(redirect)}`;
      const result=await WebBrowser.openAuthSessionAsync(authUrl,redirect);
      if(result.type!=='success') return;
      const parsed=Linking.parse(result.url); const token=parsed.queryParams?.token; const error=parsed.queryParams?.error;
      if(error) throw new Error(String(error)); if(!token) throw new Error('SNS 로그인 토큰을 받지 못했습니다.');
      await setToken(String(token)); const user=await api.getProfile(); onLoggedIn?.(user);
    }catch(e){Alert.alert('SNS 로그인 실패',e.message==='OAUTH_NOT_CONFIGURED'?'관리자가 해당 SNS 로그인 키를 아직 설정하지 않았습니다.':e.message)}
    finally{setSocialLoading('')}
  };
  return <View style={s.wrap}>
    <Text style={s.kicker}>BODYCHECK ACCOUNT</Text><Text style={s.title}>{mode==='login'?'로그인':'회원가입'}</Text>
    <TextInput style={s.input} autoCapitalize="none" keyboardType="email-address" placeholder="이메일 주소" value={email} onChangeText={setEmail}/>
    <TextInput style={s.input} secureTextEntry placeholder="비밀번호 8자 이상" value={password} onChangeText={setPassword}/>
    <Pressable style={[s.primary,loading&&s.disabled]} onPress={submit} disabled={loading}>{loading?<ActivityIndicator color="#fff"/>:<Text style={s.primaryText}>{mode==='login'?'로그인':'계정 만들기'}</Text>}</Pressable>
    <Pressable onPress={()=>setMode(mode==='login'?'register':'login')}><Text style={s.link}>{mode==='login'?'처음이신가요? 회원가입':'이미 계정이 있나요? 로그인'}</Text></Pressable>
    <View style={s.divider}><View style={s.line}/><Text style={s.or}>또는 SNS로 계속</Text><View style={s.line}/></View>
    <Pressable style={s.social} onPress={()=>social('google')} disabled={!!socialLoading}><Text style={s.socialText}>{socialLoading==='google'?'연결 중...':'Google로 계속'}</Text></Pressable>
    <Pressable style={s.social} onPress={()=>social('kakao')} disabled={!!socialLoading}><Text style={s.socialText}>{socialLoading==='kakao'?'연결 중...':'Kakao로 계속'}</Text></Pressable>
    <Pressable style={s.social} onPress={()=>social('naver')} disabled={!!socialLoading}><Text style={s.socialText}>{socialLoading==='naver'?'연결 중...':'Naver로 계속'}</Text></Pressable>
  </View>
}
const s=StyleSheet.create({wrap:{flex:1,justifyContent:'center',padding:24,backgroundColor:'#F5F8FB',gap:12},kicker:{fontSize:12,fontWeight:'800',color:'#2A6CA6'},title:{fontSize:30,fontWeight:'800',color:'#153B5A',marginBottom:8},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#D7E2EA',padding:14,borderRadius:12},primary:{backgroundColor:'#1768A8',padding:15,borderRadius:12,alignItems:'center'},disabled:{opacity:.7},primaryText:{color:'#fff',fontWeight:'800'},link:{color:'#1768A8',textAlign:'center',fontWeight:'700',padding:8},divider:{flexDirection:'row',alignItems:'center',gap:8,marginTop:8},line:{flex:1,height:1,backgroundColor:'#D7E2EA'},or:{fontSize:12,color:'#7A8A98'},social:{backgroundColor:'#fff',borderWidth:1,borderColor:'#D7E2EA',padding:13,borderRadius:12,alignItems:'center'},socialText:{fontWeight:'700',color:'#29475E'}});
