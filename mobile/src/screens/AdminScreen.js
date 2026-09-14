import React,{useEffect,useState} from 'react';
import {View,Text,TextInput,Pressable,FlatList,StyleSheet,Alert,RefreshControl} from 'react-native';
import {api} from '../services/api';

export default function AdminScreen(){
  const [q,setQ]=useState(''); const [items,setItems]=useState([]); const [loading,setLoading]=useState(false);
  const load=async()=>{setLoading(true);try{setItems(await api.adminUsers(q))}catch(e){Alert.alert('사용자 조회 실패',e.message)}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const update=async(item,patch)=>{try{await api.updateUser(item.id,patch);await load()}catch(e){Alert.alert('변경 실패',e.message)}};
  return <View style={s.wrap}>
    <Text style={s.title}>사용자 관리</Text><Text style={s.desc}>가입자 조회, 계정 정지, 관리자 권한을 관리합니다.</Text>
    <View style={s.searchRow}><TextInput style={s.search} value={q} onChangeText={setQ} placeholder="이메일/이름 검색" onSubmitEditing={load}/><Pressable style={s.searchBtn} onPress={load}><Text style={s.btnText}>검색</Text></Pressable></View>
    <FlatList data={items} keyExtractor={x=>x.id} refreshControl={<RefreshControl refreshing={loading} onRefresh={load}/>} renderItem={({item})=><View style={s.card}>
      <Text style={s.email}>{item.email}</Text><Text style={s.meta}>{item.name||'이름 없음'} · {item.role} · {item.status}</Text><Text style={s.meta}>기록 {item._count?.records??0} · SNS {item._count?.identities??0}</Text>
      <View style={s.actions}><Pressable style={s.action} onPress={()=>update(item,{status:item.status==='ACTIVE'?'SUSPENDED':'ACTIVE'})}><Text>{item.status==='ACTIVE'?'사용 정지':'사용 재개'}</Text></Pressable><Pressable style={s.action} onPress={()=>update(item,{role:item.role==='ADMIN'?'USER':'ADMIN'})}><Text>{item.role==='ADMIN'?'일반 사용자로':'관리자로 지정'}</Text></Pressable></View>
    </View>}/>
  </View>
}
const s=StyleSheet.create({wrap:{flex:1,padding:18,backgroundColor:'#F6F9FB'},title:{fontSize:24,fontWeight:'800',color:'#153B5A'},desc:{color:'#728391',marginTop:4,marginBottom:12},searchRow:{flexDirection:'row',gap:8},search:{flex:1,backgroundColor:'#fff',borderWidth:1,borderColor:'#D7E2EA',borderRadius:10,padding:12},searchBtn:{backgroundColor:'#1768A8',paddingHorizontal:18,justifyContent:'center',borderRadius:10},btnText:{color:'#fff',fontWeight:'800'},card:{backgroundColor:'#fff',padding:14,borderRadius:12,marginTop:10},email:{fontWeight:'800',color:'#23465F'},meta:{fontSize:12,color:'#7A8A98',marginTop:4},actions:{flexDirection:'row',gap:8,marginTop:10},action:{backgroundColor:'#EEF4F8',padding:9,borderRadius:8}});
