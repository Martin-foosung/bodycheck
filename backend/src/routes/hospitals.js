import {Router} from 'express';
import {searchHiraHospitals} from '../services/hira.js';
const r=Router();

r.post('/search',async(req,res)=>{
  try{
    const b=req.body||{};
    if(b.lat==null || b.lng==null) return res.status(400).json({error:'LOCATION_REQUIRED'});
    res.json(await searchHiraHospitals(b));
  }catch(e){
    res.status(500).json({error:'HOSPITAL_SEARCH_FAILED',message:e.message});
  }
});
export default r;
