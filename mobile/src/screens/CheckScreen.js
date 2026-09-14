import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet,Alert} from 'react-native';
import BodySelector from '../components/BodySelector';
import {api} from '../services/api';

const DETAILS={
  머리:['이마','관자놀이','정수리','뒤통수','머리 전체'],
  목:['목 앞쪽','목 옆쪽','목 뒤쪽','목-어깨 경계'],
  가슴:['가슴 중앙','왼쪽 가슴','오른쪽 가슴','갈비뼈 주변'],
  배:['명치','배꼽 주변','오른쪽 윗배','왼쪽 윗배','오른쪽 아랫배','왼쪽 아랫배'],
  등:['등 위쪽','등 중앙','허리','왼쪽 옆구리','오른쪽 옆구리'],
  팔:['어깨','위팔','팔꿈치 바깥쪽','팔꿈치 안쪽','아래팔'],
  손:['손목','손바닥','손등','엄지','손가락'],
  골반:['골반 앞쪽','왼쪽 골반','오른쪽 골반','사타구니','고관절','엉덩이','회음부','생식기'],
  다리:['허벅지','무릎 앞쪽','무릎 뒤쪽','종아리','정강이'],
  발:['발목','발등','발바닥','뒤꿈치','발가락']
};
const SYMPTOMS={
  머리:['두통','압박감','찌르는 통증','어지러움','저림'],목:['통증','붓기','뻣뻣함','저림','열감'],
  가슴:['가슴 통증','압박감/조이는 느낌','두근거림','숨참','찌르는 통증'],배:['복통','찌르는 통증','압박감/묵직함','붓기','메스꺼움'],
  등:['통증','찌르는 통증','저림','뻣뻣함','힘 빠짐'],팔:['통증','저림','힘 빠짐','붓기','움직임 제한'],
  손:['통증','저림','붓기','힘 빠짐','뻣뻣함'],골반:['골반 통증','찌르는 통증','압박감/묵직함','배뇨 시 통증','붓기'],
  다리:['통증','저림','붓기','힘 빠짐','쥐/경련'],발:['통증','저림','붓기','열감','움직임 제한']
};
const ONSETS=['갑자기','오늘','1~3일 전','1주 이상'];
const DURATIONS=['수분','수시간','1~3일','1주 이상'];
const TRENDS=['호전 중','비슷함','점점 심해짐','갑자기 심해짐'];

function Chip({label,active,onPress}){return <Pressable onPress={onPress} style={[s.chip,active&&s.active]}><Text style={[s.chipText,active&&s.activeText]}>{label}</Text></Pressable>}
function StepHeader({n,title,sub}){return <View style={{marginBottom:12}}><Text style={s.step}>{n}. {title}</Text>{!!sub&&<Text style={s.sub}>{sub}</Text>}</View>}

function redFlagQuestions(part,symptom){
  const q=[];
  if(part==='가슴'||symptom==='숨참'||symptom.includes('압박')) q.push(['breath','숨이 차거나 식은땀·실신 느낌이 있나요?']);
  if(part==='머리') q.push(['neuro','갑작스러운 마비·말 어눌함·시야 이상이 있나요?']);
  if(part==='등') q.push(['cauda','새로운 배뇨/배변 장애 또는 회음부 감각저하가 있나요?']);
  if(part==='다리'&&symptom==='붓기') q.push(['dvt','한쪽 다리만 갑자기 붓고 숨이 차나요?']);
  if(part==='골반') q.push(['pelvic','임신 가능성과 비정상 출혈 또는 실신 느낌이 함께 있나요?']);
  if(part==='골반') q.push(['testicular','고환/음낭에 갑작스럽고 매우 심한 통증이 있나요?']);
  q.push(['fever','고열 또는 빠르게 악화되는 전신 상태가 있나요?']);
  return q;
}

function evaluate(part,detail,symptom,meta,answers){
  const emergency=Object.entries(answers).some(([k,v])=>v===true && ['breath','neuro','cauda','dvt','pelvic','testicular'].includes(k));
  const urgent=!emergency && (meta.intensity>=8 || meta.trend==='갑자기 심해짐' || answers.fever===true);
  const riskLevel=emergency?'emergency':urgent?'urgent':meta.intensity>=6?'soon':'routine';
  let department='가정의학과';
  const map={머리:'신경과',목:'정형외과',가슴:'내과',배:'내과',등:'정형외과',팔:'정형외과',손:'정형외과',골반:'산부인과',다리:'정형외과',발:'정형외과'};
  department=map[part]||department;
  if(part==='골반'&&(symptom.includes('배뇨')||detail==='생식기')) department='비뇨의학과';
  if(emergency) department='응급의학과';
  const labels=[];
  if(part==='목') labels.push('근육·인대 긴장 가능성','경추 주변 염좌 또는 신경 자극 가능성');
  else if(part==='가슴') labels.push('흉벽 근골격계 통증 가능성','심폐 관련 원인 감별 필요');
  else if(part==='배') labels.push('위장관 자극 또는 소화기 원인 가능성','복벽·주변 조직 통증 가능성');
  else if(part==='등') labels.push('허리·등 근골격계 통증 가능성','신경 자극 가능성');
  else if(part==='팔'||part==='손') labels.push('관절·힘줄·근육 과사용 가능성','말초신경 자극 가능성');
  else if(part==='다리'||part==='발') labels.push('근육·관절·인대 문제 가능성','부종 또는 신경 자극 가능성');
  else if(part==='골반') labels.push('골반 근골격계 통증 가능성',department==='비뇨의학과'?'방광·요로 자극 가능성':'골반 장기 관련 원인 감별 필요');
  else labels.push('긴장성 또는 신경성 증상 가능성','현재 부위의 염증·근골격계 원인 가능성');
  return {riskLevel,department,candidates:labels};
}

export default function CheckScreen({navigation}){
  const [step,setStep]=useState(1); const [side,setSide]=useState('front');
  const [part,setPart]=useState(''); const [detail,setDetail]=useState(''); const [symptom,setSymptom]=useState('');
  const [meta,setMeta]=useState({intensity:5,onset:'오늘',duration:'수시간',trend:'비슷함'}); const [answers,setAnswers]=useState({});
  const [result,setResult]=useState(null); const [saving,setSaving]=useState(false);
  const questions=useMemo(()=>redFlagQuestions(part,symptom),[part,symptom]);
  const reset=()=>{setStep(1);setPart('');setDetail('');setSymptom('');setMeta({intensity:5,onset:'오늘',duration:'수시간',trend:'비슷함'});setAnswers({});setResult(null)};
  const selectPart=p=>{setPart(p);setDetail('');setSymptom('');setAnswers({});setStep(2)};
  const finish=()=>{const r=evaluate(part,detail,symptom,meta,answers);setResult(r);setStep(6)};
  const save=async()=>{if(!result)return;setSaving(true);try{await api.saveHealthRecord({path:[part,detail].filter(Boolean),symptom,symptomMeta:meta,answers,riskLevel:result.riskLevel,department:result.department});Alert.alert('저장 완료','건강기록에 저장했습니다.')}catch(e){Alert.alert('저장 실패',e.message)}finally{setSaving(false)}};
  const riskLabel=result?.riskLevel==='emergency'?'응급':result?.riskLevel==='urgent'?'긴급 확인':result?.riskLevel==='soon'?'빠른 진료 권장':'일반 진료';
  return <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
    <View style={s.progress}><Text style={s.progressText}>증상 확인 {Math.min(step,6)} / 6</Text><View style={s.progressTrack}><View style={[s.progressFill,{width:`${Math.min(step,6)/6*100}%`}]}/></View></View>
    {step===1&&<><StepHeader n="1" title="인체에서 불편한 부위를 선택하세요" sub="버튼 목록이 아니라 인체모형을 직접 눌러 시작합니다."/><BodySelector side={side} selected={part} onSelect={selectPart} onSideChange={setSide}/></>}
    {step===2&&<><StepHeader n="2" title={`${part}의 세부 위치`} sub="가장 불편한 위치를 선택하세요."/><View style={s.grid}>{(DETAILS[part]||[part]).map(x=><Chip key={x} label={x} active={detail===x} onPress={()=>setDetail(x)}/>)}</View><Nav back={()=>setStep(1)} next={()=>detail&&setStep(3)} disabled={!detail}/></>}
    {step===3&&<><StepHeader n="3" title="증상을 선택하세요" sub={`${part} · ${detail}`}/><View style={s.grid}>{(SYMPTOMS[part]||['통증','붓기','저림']).map(x=><Chip key={x} label={x} active={symptom===x} onPress={()=>setSymptom(x)}/>)}</View><Nav back={()=>setStep(2)} next={()=>symptom&&setStep(4)} disabled={!symptom}/></>}
    {step===4&&<><StepHeader n="4" title="증상 경과" sub="강도와 발생 양상을 입력하면 위험도 판단에 반영됩니다."/>
      <Text style={s.label}>강도 {meta.intensity}/10</Text><View style={s.scale}>{[0,1,2,3,4,5,6,7,8,9,10].map(n=><Pressable key={n} onPress={()=>setMeta({...meta,intensity:n})} style={[s.scaleBtn,meta.intensity===n&&s.scaleOn]}><Text style={[s.scaleText,meta.intensity===n&&s.activeText]}>{n}</Text></Pressable>)}</View>
      <Choice title="발생 시점" values={ONSETS} value={meta.onset} setValue={v=>setMeta({...meta,onset:v})}/><Choice title="지속시간" values={DURATIONS} value={meta.duration} setValue={v=>setMeta({...meta,duration:v})}/><Choice title="변화" values={TRENDS} value={meta.trend} setValue={v=>setMeta({...meta,trend:v})}/><Nav back={()=>setStep(3)} next={()=>setStep(5)}/></>}
    {step===5&&<><StepHeader n="5" title="안전 확인" sub="위험 신호가 있으면 일반 결과보다 응급 안내를 우선합니다."/>{questions.map(([k,q])=><View key={k} style={s.qcard}><Text style={s.qtext}>{q}</Text><View style={s.yesno}><Chip label="아니요" active={answers[k]===false} onPress={()=>setAnswers({...answers,[k]:false})}/><Chip label="예" active={answers[k]===true} onPress={()=>setAnswers({...answers,[k]:true})}/></View></View>)}<Nav back={()=>setStep(4)} next={finish} disabled={questions.some(([k])=>answers[k]===undefined)} nextText="결과 보기"/></>}
    {step===6&&result&&<><StepHeader n="6" title="확인 결과" sub={`${part} > ${detail} · ${symptom}`}/><View style={[s.risk,result.riskLevel==='emergency'&&s.riskEmergency]}><Text style={s.riskTitle}>위험도: {riskLabel}</Text><Text style={s.riskText}>{result.riskLevel==='emergency'?'응급 신호가 확인되었습니다. 한국에서는 119 또는 가까운 응급실 이용을 우선하세요.':'증상 변화가 있거나 악화되면 의료기관에서 직접 평가받으세요.'}</Text></View><View style={s.resultCard}><Text style={s.resultTitle}>가능한 관련 원인</Text>{result.candidates.map((x,i)=><Text key={x} style={s.candidate}>{i+1}. {x}</Text>)}<Text style={s.dept}>권장 진료과 · {result.department}</Text><Text style={s.disclaimer}>이 결과는 진단이 아니며 의료진의 진료를 대체하지 않습니다.</Text></View><Pressable style={s.primary} onPress={save} disabled={saving}><Text style={s.primaryText}>{saving?'저장 중...':'건강기록에 저장'}</Text></Pressable><Pressable style={s.secondary} onPress={()=>navigation.navigate('병원',{department:result.department,careContext:`${part} ${detail} ${symptom} 강도 ${meta.intensity}/10 ${meta.trend}`,riskLevel:result.riskLevel})}><Text style={s.secondaryText}>이 조건으로 주변 병원 찾기</Text></Pressable><Pressable onPress={reset}><Text style={s.restart}>처음부터 다시</Text></Pressable></>}
  </ScrollView>
}

function Nav({back,next,disabled=false,nextText='다음 단계'}){return <View style={s.nav}><Pressable style={s.back} onPress={back}><Text style={s.backText}>이전</Text></Pressable><Pressable style={[s.next,disabled&&s.disabled]} onPress={next} disabled={disabled}><Text style={s.nextText}>{nextText}</Text></Pressable></View>}
function Choice({title,values,value,setValue}){return <View style={{marginTop:16}}><Text style={s.label}>{title}</Text><View style={s.grid}>{values.map(x=><Chip key={x} label={x} active={value===x} onPress={()=>setValue(x)}/>)}</View></View>}

const s=StyleSheet.create({
  wrap:{padding:20,paddingBottom:44,backgroundColor:'#F6F9FB'},progress:{marginBottom:18},progressText:{fontSize:12,color:'#6B7D8C',fontWeight:'700'},progressTrack:{height:6,backgroundColor:'#E3EBF1',borderRadius:99,marginTop:7,overflow:'hidden'},progressFill:{height:6,backgroundColor:'#1768A8'},
  step:{fontSize:22,fontWeight:'900',color:'#173F5E'},sub:{fontSize:13,color:'#708392',marginTop:5,lineHeight:19},grid:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{backgroundColor:'#fff',borderWidth:1,borderColor:'#D7E2EA',paddingVertical:11,paddingHorizontal:15,borderRadius:999},active:{backgroundColor:'#1768A8',borderColor:'#1768A8'},chipText:{color:'#4E6475',fontWeight:'700'},activeText:{color:'#fff',fontWeight:'800'},
  nav:{flexDirection:'row',gap:10,marginTop:24},back:{flex:1,padding:15,borderRadius:13,borderWidth:1,borderColor:'#C9D7E1',alignItems:'center',backgroundColor:'#fff'},backText:{color:'#536C7D',fontWeight:'800'},next:{flex:2,padding:15,borderRadius:13,alignItems:'center',backgroundColor:'#1768A8'},nextText:{color:'#fff',fontWeight:'900'},disabled:{opacity:.35},
  label:{fontSize:15,fontWeight:'800',color:'#254A64',marginBottom:9},scale:{flexDirection:'row',flexWrap:'wrap',gap:6},scaleBtn:{width:38,height:38,borderRadius:19,backgroundColor:'#fff',borderWidth:1,borderColor:'#D7E2EA',alignItems:'center',justifyContent:'center'},scaleOn:{backgroundColor:'#1768A8',borderColor:'#1768A8'},scaleText:{color:'#5E7180',fontWeight:'700'},
  qcard:{backgroundColor:'#fff',borderRadius:15,padding:15,marginBottom:10,borderWidth:1,borderColor:'#E2EAF0'},qtext:{fontSize:15,color:'#29475E',fontWeight:'700',lineHeight:21},yesno:{flexDirection:'row',gap:8,marginTop:11},
  risk:{backgroundColor:'#FFF6DC',borderRadius:16,padding:17,borderWidth:1,borderColor:'#F0D98A'},riskEmergency:{backgroundColor:'#FCE7E7',borderColor:'#E7A1A1'},riskTitle:{fontSize:19,fontWeight:'900',color:'#82331F'},riskText:{fontSize:13,color:'#775A50',lineHeight:20,marginTop:6},resultCard:{backgroundColor:'#fff',borderRadius:16,padding:17,marginTop:12},resultTitle:{fontSize:17,fontWeight:'900',color:'#173F5E'},candidate:{fontSize:14,color:'#405B6F',marginTop:10},dept:{fontSize:15,fontWeight:'900',color:'#1768A8',marginTop:16},disclaimer:{fontSize:11,color:'#8795A1',lineHeight:17,marginTop:12},
  primary:{marginTop:12,backgroundColor:'#1768A8',padding:15,borderRadius:13,alignItems:'center'},primaryText:{color:'#fff',fontWeight:'900'},secondary:{marginTop:9,backgroundColor:'#fff',padding:15,borderRadius:13,alignItems:'center',borderWidth:1,borderColor:'#1768A8'},secondaryText:{color:'#1768A8',fontWeight:'900'},restart:{textAlign:'center',color:'#6D8190',fontWeight:'700',padding:16}
});
