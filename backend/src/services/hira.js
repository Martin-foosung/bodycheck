const HIRA_BASE='https://apis.data.go.kr/B551182/hospInfoServicev2';

function n(v){ const x=Number(v); return Number.isFinite(x)?x:null; }
function distanceKm(lat1,lon1,lat2,lon2){
  if([lat1,lon1,lat2,lon2].some(v=>v==null)) return null;
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function deptCode(name=''){
  const m={
    '내과':'01','신경과':'02','외과':'04','정형외과':'05','신경외과':'06',
    '산부인과':'10','소아청소년과':'11','안과':'12','이비인후과':'13',
    '피부과':'14','비뇨의학과':'15','재활의학과':'21','가정의학과':'23',
    '응급의학과':'24','치과':'49'
  };
  return m[name]||'';
}
function contextBonus(name='',ctx=''){
  const t=String(ctx), h=String(name);
  let b=0;
  const rules=[
    [['무릎','관절','인대'],['정형외과'],5],
    [['척추','허리','목','방사통'],['정형외과','신경외과'],6],
    [['흉통','심장','심혈관'],['내과','응급'],7],
    [['뇌졸중','마비','뇌혈관'],['신경','응급'],8],
    [['골반','임신','질출혈'],['산부인과'],7],
    [['고환','요로','배뇨'],['비뇨'],6]
  ];
  for(const [ck,hk,p] of rules) if(ck.some(x=>t.includes(x)) && hk.some(x=>h.includes(x))) b+=p;
  if(/강도 (8|9|10)\/10/.test(t)) b+=2;
  if(t.includes('갑자기 심해짐')||t.includes('점점 심해짐')) b+=2;
  return b;
}

export async function searchHiraHospitals({lat,lng,department='',radiusKm=5,careContext=''}) {
  const key=process.env.HIRA_API_KEY;
  if(!key) return {source:'HIRA_NOT_CONFIGURED',warning:'HIRA_API_KEY is missing',hospitals:[]};

  const params=new URLSearchParams({
    serviceKey:key,
    pageNo:'1',
    numOfRows:'100',
    _type:'json'
  });
  const dcode=deptCode(department);
  if(dcode) params.set('dgsbjtCd',dcode);

  const url=`${HIRA_BASE}/getHospBasisList?${params.toString()}`;
  const resp=await fetch(url,{headers:{Accept:'application/json'}});
  if(!resp.ok) throw new Error(`HIRA HTTP ${resp.status}`);
  const data=await resp.json();

  const body=data?.response?.body||{};
  let rows=body?.items?.item||[];
  if(!Array.isArray(rows)) rows=rows?[rows]:[];

  const normalized=rows.map(x=>{
    const hlat=n(x.YPos ?? x.yPos), hlng=n(x.XPos ?? x.xPos);
    const dist=distanceKm(n(lat),n(lng),hlat,hlng);
    let score=50;
    const reasons=[];
    if(department){ score+=20; reasons.push(`${department} 조회조건 일치`); }
    if(dist!=null){
      if(dist<=2){score+=20;reasons.push('2km 이내');}
      else if(dist<=5){score+=14;reasons.push('5km 이내');}
      else if(dist<=10){score+=7;reasons.push('10km 이내');}
    }
    const cb=contextBonus(x.yadmNm||'',careContext);
    if(cb){score+=cb;reasons.push('현재 증상 맥락 반영');}
    return {
      ykiho:x.ykiho,
      name:x.yadmNm,
      address:x.addr,
      tel:x.telno,
      hospitalType:x.clCdNm,
      latitude:hlat, longitude:hlng,
      distanceKm:dist==null?null:Number(dist.toFixed(2)),
      department,
      matchScore:Math.min(100,Math.round(score)),
      matchReasons:reasons
    };
  }).filter(h=>h.distanceKm==null || h.distanceKm<=Number(radiusKm||5))
    .sort((a,b)=>(b.matchScore-a.matchScore)||((a.distanceKm??999)-(b.distanceKm??999)))
    .slice(0,30);

  return {source:'HIRA',total:Number(body?.totalCount||normalized.length),hospitals:normalized};
}
