import React,{useEffect,useState} from 'react';
import {ActivityIndicator,View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import CheckScreen from './src/screens/CheckScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HospitalsScreen from './src/screens/HospitalsScreen';
import LoginScreen from './src/screens/LoginScreen';
import {api} from './src/services/api';
import {clearToken,getToken} from './src/services/auth';

const Tab=createBottomTabNavigator();

export default function App(){
  const [loading,setLoading]=useState(true);
  const [user,setUser]=useState(null);

  useEffect(()=>{
    (async()=>{
      const token=await getToken();
      if(token){
        try{setUser(await api.getProfile())}
        catch{await clearToken()}
      }
      setLoading(false);
    })();
  },[]);

  if(loading) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator/></View>;
  if(!user) return <LoginScreen onLoggedIn={setUser}/>;

  return <NavigationContainer>
    <Tab.Navigator screenOptions={{headerShown:true}}>
      <Tab.Screen name="홈" component={HomeScreen}/>
      <Tab.Screen name="증상" component={CheckScreen}/>
      <Tab.Screen name="기록" component={HistoryScreen}/>
      <Tab.Screen name="병원" component={HospitalsScreen}/>
    </Tab.Navigator>
  </NavigationContainer>
}
