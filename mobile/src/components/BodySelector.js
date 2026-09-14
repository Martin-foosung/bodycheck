import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';

function Part({style,label,onPress,selected=false}){
  return <Pressable accessibilityRole="button" accessibilityLabel={`${label} 선택`} onPress={onPress}
    style={[s.part,style,selected&&s.selected]}><Text style={[s.partText,selected&&s.selectedText]}>{label}</Text></Pressable>
}

export default function BodySelector({side='front',selected,onSelect,onSideChange}){
  const back=side==='back';
  return <View style={s.wrap}>
    <View style={s.toggle}>
      <Pressable style={[s.toggleBtn,!back&&s.toggleOn]} onPress={()=>onSideChange('front')}><Text style={[s.toggleText,!back&&s.toggleTextOn]}>앞면</Text></Pressable>
      <Pressable style={[s.toggleBtn,back&&s.toggleOn]} onPress={()=>onSideChange('back')}><Text style={[s.toggleText,back&&s.toggleTextOn]}>뒷면</Text></Pressable>
    </View>
    <View style={s.stage}>
      <Part label="머리" selected={selected==='머리'} onPress={()=>onSelect('머리')} style={s.head}/>
      <Part label="목" selected={selected==='목'} onPress={()=>onSelect('목')} style={s.neck}/>
      <Part label={back?'등':'가슴'} selected={selected===(back?'등':'가슴')} onPress={()=>onSelect(back?'등':'가슴')} style={s.upper}/>
      <Part label={back?'허리':'배'} selected={selected===(back?'등':'배')} onPress={()=>onSelect(back?'등':'배')} style={s.mid}/>
      <Part label={back?'엉덩이':'골반'} selected={selected==='골반'} onPress={()=>onSelect('골반')} style={s.pelvis}/>
      <Part label="팔" selected={selected==='팔'} onPress={()=>onSelect('팔')} style={[s.arm,s.leftArm]}/>
      <Part label="팔" selected={selected==='팔'} onPress={()=>onSelect('팔')} style={[s.arm,s.rightArm]}/>
      <Part label="손" selected={selected==='손'} onPress={()=>onSelect('손')} style={[s.hand,s.leftHand]}/>
      <Part label="손" selected={selected==='손'} onPress={()=>onSelect('손')} style={[s.hand,s.rightHand]}/>
      <Part label="다리" selected={selected==='다리'} onPress={()=>onSelect('다리')} style={[s.leg,s.leftLeg]}/>
      <Part label="다리" selected={selected==='다리'} onPress={()=>onSelect('다리')} style={[s.leg,s.rightLeg]}/>
      <Part label="발" selected={selected==='발'} onPress={()=>onSelect('발')} style={[s.foot,s.leftFoot]}/>
      <Part label="발" selected={selected==='발'} onPress={()=>onSelect('발')} style={[s.foot,s.rightFoot]}/>
    </View>
    <Text style={s.hint}>인체모형에서 불편한 부위를 직접 눌러주세요. 앞/뒤를 전환할 수 있습니다.</Text>
  </View>
}

const skin='#E8D7CB', line='#CDB9AD', blue='#1768A8';
const s=StyleSheet.create({
  wrap:{backgroundColor:'#fff',borderRadius:22,padding:16,borderWidth:1,borderColor:'#E3EBF1'},
  toggle:{alignSelf:'center',flexDirection:'row',backgroundColor:'#EFF4F7',borderRadius:999,padding:4,marginBottom:10},
  toggleBtn:{paddingVertical:8,paddingHorizontal:22,borderRadius:999},toggleOn:{backgroundColor:blue},toggleText:{color:'#62778A',fontWeight:'700'},toggleTextOn:{color:'#fff'},
  stage:{height:510,width:280,alignSelf:'center',position:'relative'},
  part:{position:'absolute',backgroundColor:skin,borderWidth:1,borderColor:line,alignItems:'center',justifyContent:'center'},
  selected:{backgroundColor:'#A9D1EC',borderColor:blue,borderWidth:2},partText:{fontSize:11,color:'#7C665A',fontWeight:'700'},selectedText:{color:'#0F568A'},
  head:{top:8,left:104,width:72,height:82,borderRadius:38},neck:{top:86,left:126,width:28,height:30,borderRadius:10},
  upper:{top:112,left:85,width:110,height:110,borderTopLeftRadius:38,borderTopRightRadius:38,borderBottomLeftRadius:22,borderBottomRightRadius:22},
  mid:{top:214,left:94,width:92,height:82,borderRadius:25},pelvis:{top:286,left:91,width:98,height:62,borderRadius:27},
  arm:{top:120,width:31,height:176,borderRadius:18},leftArm:{left:45,transform:[{rotate:'7deg'}]},rightArm:{right:45,transform:[{rotate:'-7deg'}]},
  hand:{top:292,width:35,height:48,borderRadius:18},leftHand:{left:32},rightHand:{right:32},
  leg:{top:339,width:42,height:137,borderRadius:22},leftLeg:{left:91},rightLeg:{right:91},
  foot:{top:468,width:54,height:31,borderRadius:18},leftFoot:{left:76},rightFoot:{right:76},
  hint:{textAlign:'center',fontSize:12,color:'#738596',lineHeight:18,marginTop:8}
});
