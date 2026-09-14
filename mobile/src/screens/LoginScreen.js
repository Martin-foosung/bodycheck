import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,Alert} from 'react-native';
import {api} from '../services/api';
import {setToken} from '../services/auth';

export default function LoginScreen({onLoggedIn}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [mode,setMode]=useState('login');
  const [loading,setLoading]=useState(false);

  const submit=async()=>{
    setLoading(true);
    try{
      const data=mode==='login'?await api.login(email,password):await api.register(email,password);
      await setToken(data.token);
      onLoggedIn?.(data.user);
    }catch(e){Alert.alert('로그인 오류',e.message)}
    finally{setLoading(false)}
  };

  return <View style={s.wrap}>
    <Text style={s.kicker}>BODYCHECK ACCOUNT</Text>
    <Text style={s.title}>{mode==='login'?'로그인':'회원가입'}</Text>
    <TextInput style={s.input} autoCapitalize="none" keyboardType="email-address" placeholder="이메일" value={email} onChangeText={setEmail}/>
    <TextInput style={s.input} secureTextEntry placeholder="비밀번호 8자 이상" value={password} onChangeText={setPassword}/>
    <Pressable style={s.primary} onPress={submit} disabled={loading}><Text style={s.primaryText}>{loading?'처리 중...':mode==='login'?'로그인':'계정 만들기'}</Text></Pressable>
    <Pressable onPress={()=>setMode(mode==='login'?'register':'login')}><Text style={s.link}>{mode==='login'?'처음이신가요? 회원가입':'이미 계정이 있나요? 로그인'}</Text></Pressable>
  </View>
}
const s=StyleSheet.create({
  wrap:{flex:1,justifyContent:'center',padding:24,backgroundColor:'#F5F8FB',gap:12},
  kicker:{fontSize:12,fontWeight:'800',color:'#2A6CA6'},
  title:{fontSize:30,fontWeight:'800',color:'#153B5A',marginBottom:8},
  input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#D7E2EA',padding:14,borderRadius:12},
  primary:{backgroundColor:'#1768A8',padding:15,borderRadius:12,alignItems:'center'},
  primaryText:{color:'#fff',fontWeight:'800'},
  link:{color:'#1768A8',textAlign:'center',fontWeight:'700',padding:8}
});
