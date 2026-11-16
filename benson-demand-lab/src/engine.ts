/** Browser-only model boundary. This module has no network or customer data. */
export type Menu = (string | null)[];
export const STATIONS = [
  {id:'fire',name:'Fire Grill',color:'#a51c30'},
  {id:'chef',name:'The Chef’s Table',color:'#c48a38'},
  {id:'garden',name:'The Garden',color:'#4e8068'},
  {id:'spice',name:'The Spice Market',color:'#6d6aa2'},
];
export interface Dish {id:string;stationId:string;name:string;fullName:string;provenance:string;recipe:{ingredient:string;grams:number}[]}
const dish=(id:string,stationId:string,name:string,fullName:string,real:boolean,recipe:Record<string,number>):Dish=>({id,stationId,name,fullName,provenance:real?'SCU menu example · verified Nov 10, 2026':'Fictional demonstration dish',recipe:Object.entries(recipe).map(([ingredient,grams])=>({ingredient,grams}))});
export const MENU_SOURCE = {url:'https://scudining.cafebonappetit.com/',verified:'2026-11-10',scope:'Public dish and station names only. All schedules, portions and recipe weights are synthetic. Dinner/all-day examples are reused in fictional lunch menus.'};
export const DISHES: Dish[] = [
 dish('burger','fire','Smash burger','Signature Smash Burger',true,{'Ground beef':130,'Bun':75,'Cheese':20,'Onion':20}),
 dish('chicken','fire','Chicken sandwich','Fried Chicken Sandwich',true,{'Chicken':150,'Bun':75,'Cabbage':30,'Oil':10}),
 dish('tuna','fire','Tuna melt','Tuna Melt',true,{'Tuna':110,'Bread':90,'Cheese':25,'Onion':15}),
 dish('harvest','chef','Caribbean harvest bowl','Build Your Own Caribbean Harvest Bowl',true,{'Chicken':110,'Rice (dry)':70,'Beans (cooked)':75,'Sweet potato':80,'Tomato':40}),
 dish('lemon','chef','Lemon chicken bowl','Lemon Chicken and Rice Bowl',false,{'Chicken':140,'Rice (dry)':75,'Carrot':65,'Onion':20}),
 dish('chickpea','chef','Roasted chickpea bowl','Roasted Chickpea and Sweet Potato Bowl',false,{'Chickpeas (cooked)':130,'Rice (dry)':65,'Sweet potato':100,'Kale':35}),
 dish('pasta','garden','Harvest pasta salad','Root Vegetable, Cranberry, and Kale Pasta Salad with Herb Vinaigrette',true,{'Pasta (dry)':85,'Carrot':50,'Squash':60,'Kale':35,'Dried cranberries':15,'Oil':12}),
 dish('quinoa','garden','Quinoa garden salad','Quinoa Garden Salad',false,{'Quinoa (dry)':75,'Chickpeas (cooked)':80,'Tomato':70,'Kale':40,'Oil':10}),
 dish('lentil','garden','Warm lentil salad','Warm Lentil and Root Vegetable Salad',false,{'Lentils (cooked)':160,'Carrot':90,'Kale':45,'Onion':25,'Oil':10}),
 dish('sisig','spice','Crispy tofu sisig','Crispy Tofu Sisig',true,{'Tofu':150,'Rice (dry)':70,'Onion':40,'Peppers':50,'Oil':12}),
 dish('curry','spice','Coconut tofu curry','Coconut Tofu Curry',false,{'Tofu':140,'Rice (dry)':75,'Coconut milk':80,'Carrot':50,'Onion':25}),
 dish('noodles','spice','Ginger sesame noodles','Ginger Sesame Tofu Noodles',false,{'Noodles (dry)':90,'Tofu':110,'Cabbage':65,'Carrot':35,'Oil':10}),
];
export interface Day {id:string;index:number;week:number;weekday:string;label:string;traffic:number;menu:Menu}
const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday'];
export const DAYS:Day[]=Array.from({length:25},(_,index)=>({id:`day-${index+1}`,index,week:Math.floor(index/5)+1,weekday:weekdays[index%5],label:`Week ${Math.floor(index/5)+1} · ${weekdays[index%5]}`,traffic:[640,710,680,760,590][index%5]+Math.floor(index/5)*8,menu:STATIONS.map((s,i)=>DISHES.filter(d=>d.stationId===s.id)[(index+(i===1?Math.floor(index/5):i))%3].id)}));
export interface Model {appeal:Record<string,number>;dayBias:number[];services:number}
export interface Forecast {menu:Menu;traffic:number;portions:number[];shares:number[];arrivalProfile:number[][]}
export interface ServiceRecord {dayIndex:number;forecast:Forecast;baseline:Forecast;observed:number[];actualTraffic:number;mae:number;baselineMae:number;modelBefore:Model;modelAfter:Model;explanation:string;preparation:number[];surplus:number;unmet:number;observedProfile:number[][];timingProvenance:"stored-before-reveal"|"reconstructed-legacy"}
export interface DemoState {version:1;model:Model;records:ServiceRecord[]}
export interface Simulation {samples:number[][];ranges:[number,number][]}
export interface Plan {id:string;name:string;description:string;quantities:number[];openingQuantities?:number[];surplus:number;unmet:number;shortageProbability:number}
const clone=<T>(v:T):T=>JSON.parse(JSON.stringify(v));
export const initialState=():DemoState=>({version:1,model:{appeal:{burger:.4,chicken:.15,tuna:-.12,harvest:.12,lemon:.05,chickpea:-.18,pasta:.05,quinoa:-.05,lentil:-.1,sisig:.1,curry:.05,noodles:.15},dayBias:Array(20).fill(0),services:0},records:[]});
export function seeded(seed:number){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const normal=(rng:()=>number)=>Math.sqrt(-2*Math.log(Math.max(1e-9,rng())))*Math.cos(2*Math.PI*rng());
const count=(n:number)=>Number.isFinite(n)?Math.min(10000,Math.max(0,Math.round(n))):0;
function cleanMenu(menu:Menu):Menu{return STATIONS.map((s,i)=>{const d=DISHES.find(x=>x.id===menu[i]);return d?.stationId===s.id?d.id:null;});}
function softmax(logits:number[],menu:Menu){const max=Math.max(...logits.filter((_,i)=>menu[i]!==null));const weights=logits.map((n,i)=>menu[i]===null?0:Math.exp(n-max));const sum=weights.reduce((a,b)=>a+b,0);return weights.map(n=>sum?n/sum:0);}
export function allocate(shares:number[],total:number):number[]{const exact=shares.map(p=>p*total),out=exact.map(Math.floor);let remaining=total-out.reduce((a,b)=>a+b,0);const order=exact.map((n,i)=>({i,f:n-out[i]})).filter(x=>shares[x.i]>0).sort((a,b)=>b.f-a.f);for(let k=0;k<remaining&&order.length;k++)out[order[k%order.length].i]++;return out;}
/** Public, fixed arrival prior; it is not learned from any service outcome. */
export const ARRIVAL_WEIGHTS = [2,4,7,10,13,14,13,11,9,7,5,3,1,1];
export function clockLabel(step:number){const minutes=11*60+step*15;const hour=Math.floor(minutes/60);return `${hour>12?hour-12:hour}:${String(minutes%60).padStart(2,'0')}`;}
export function predictedArrivalProfile(portions:number[]):number[][] {
 const total=ARRIVAL_WEIGHTS.reduce((a,b)=>a+b,0);let elapsed=0;
 return [portions.map(()=>0),...ARRIVAL_WEIGHTS.map(w=>{elapsed+=w;return portions.map(n=>Math.round(n*elapsed/total));})];
}
/** Called only after observed service demand is revealed. Never reads a forecast. */
function observedArrivalProfile(observed:number[],dayIndex:number):number[][] {
 const intervals=observed.map((total,i)=>{const rng=seeded(880031+dayIndex*1013+i*701);const weights=ARRIVAL_WEIGHTS.map((w,k)=>{const shift=1+.24*Math.sin((k+i)*.8);return w*shift*(.45+rng()*1.1);});const sum=weights.reduce((a,b)=>a+b,0);return allocate(weights.map(n=>n/sum),total);});
 const cumulative=observed.map(()=>0);
 return [observed.map(()=>0),...ARRIVAL_WEIGHTS.map((_,step)=>intervals.map((row,i)=>cumulative[i]+=row[step]))];
}
export function forecast(menu:Menu,traffic:number,model:Model,dayIndex:number):Forecast {const m=cleanMenu(menu);const t=m.some(Boolean)?count(traffic):0;const shares=softmax(m.map((id,i)=>id?(model.appeal[id]??0)+(model.dayBias[(dayIndex%5)*4+i]??0):0),m);const portions=allocate(shares,t);return{menu:m,traffic:t,shares,portions,arrivalProfile:predictedArrivalProfile(portions)};}
/** The truth simulator is deliberately separate and called only after a forecast is stored. */
function reveal(dayIndex:number,menu:Menu,traffic:number){const rng=seeded(90731+dayIndex*719);const trueAppeals:Record<string,number>={burger:1.35,chicken:1.08,tuna:.72,harvest:.35,lemon:.65,chickpea:-.02,pasta:-.62,quinoa:-.38,lentil:-.85,sisig:.28,curry:.48,noodles:.62};const trueDay=[.16,-.1,-.07,.08,-.08,.1,.08,-.05,.02,.02,-.12,.1,.18,-.06,-.12,.06,.25,-.08,-.1,.03];const actualTraffic=menu.some(Boolean)?count(traffic*(1+.035*normal(rng))):0;const logits=menu.map((id,i)=>id?(trueAppeals[id]??0)+trueDay[(dayIndex%5)*4+i]+.065*normal(rng):0);return{actualTraffic,observed:allocate(softmax(logits,menu),actualTraffic)};}
export const mae=(pred:number[],observed:number[])=>pred.reduce((sum,p,i)=>sum+Math.abs(p-(observed[i]??0)),0)/4;
export function wape(records:ServiceRecord[]){const den=records.reduce((s,r)=>s+r.actualTraffic,0);return den?records.reduce((s,r)=>s+r.forecast.portions.reduce((a,p,i)=>a+Math.abs(p-r.observed[i]),0),0)/den:null;}
export function ingredients(menu:Menu,quantities:number[]){const total:Record<string,number>={};cleanMenu(menu).forEach((id,i)=>{const q=Math.max(0,Number.isFinite(quantities[i])?quantities[i]:0);DISHES.find(d=>d.id===id)?.recipe.forEach(r=>{total[r.ingredient]=(total[r.ingredient]??0)+q*r.grams;});});return Object.entries(total).map(([ingredient,grams])=>({ingredient,grams,kilograms:grams/1000})).sort((a,b)=>b.grams-a.grams);}
export function simulate(f:Forecast,_model:Model,dayIndex:number):Simulation {const rng=seeded(51863+dayIndex*71);const samples=Array.from({length:800},()=>{const traffic=f.menu.some(Boolean)?count(f.traffic*(1+.07*normal(rng))):0;const shares=softmax(f.shares.map(p=>Math.log(Math.max(1e-9,p))+.14*normal(rng)),f.menu);return allocate(shares,traffic);});const ranges=STATIONS.map((_,i)=>{const v=samples.map(s=>s[i]).sort((a,b)=>a-b);return[v[80],v[719]] as [number,number];});return{samples,ranges};}
export function evaluatePlan(quantities:number[],sim:Simulation){let surplus=0,unmet=0,shortages=0;sim.samples.forEach(s=>{let missed=0;s.forEach((n,i)=>{const q=count(quantities[i]);surplus+=Math.max(0,q-n);missed+=Math.max(0,n-q);});unmet+=missed;if(missed>0)shortages++;});const n=sim.samples.length||1;return{surplus:surplus/n,unmet:unmet/n,shortageProbability:shortages/n};}
export function plans(f:Forecast,sim:Simulation,risk=.5):Plan[]{const open=f.menu.filter(Boolean).length;const quantile=(i:number,q:number)=>{const v=sim.samples.map(s=>s[i]).sort((a,b)=>a-b);return v[Math.min(v.length-1,Math.floor(q*v.length))]??0;};const specs=[{id:'static',name:'Static allocation',description:'Equal station allocation, 100% of expected traffic. Non-learning preparation baseline.',quantities:f.menu.map(id=>id?Math.round(f.traffic/Math.max(1,open)):0)}, {id:'buffer',name:'Availability buffer',description:'Prepare each station’s selected demand percentile. Higher availability trades for more surplus.',quantities:f.menu.map((id,i)=>id?quantile(i,.65+.3*Math.max(0,Math.min(1,risk))):0)}, {id:'batch',name:'Smaller opening batches',description:'Open at 75% of forecast; replenish up to 25% more during service. Comparison assumes all replenishment is feasible.',quantities:f.portions.map(p=>Math.round(p)),openingQuantities:f.portions.map(p=>Math.round(p*.75))}];return specs.map(s=>({...s,...evaluatePlan(s.quantities,sim)}));}
export function completeService(state:DemoState,options?:{menu?:Menu;traffic?:number;preparation?:number[]}):DemoState {if(state.records.length>=25)return clone(state);const dayIndex=state.records.length,day=DAYS[dayIndex];const before=clone(state.model);const f=forecast(options?.menu??day.menu,options?.traffic??day.traffic,before,dayIndex);const baseline=forecast(f.menu,f.traffic,initialState().model,dayIndex);/* Freeze the pre-service snapshot before revealing anything. */const frozen=clone(f);const result=reveal(dayIndex,f.menu,day.traffic);const observedProfile=observedArrivalProfile(result.observed,dayIndex);const after=clone(before);const changes:{name:string;delta:number}[]=[];if(result.actualTraffic>0){f.menu.forEach((id,i)=>{if(!id)return;const observedShare=result.observed[i]/result.actualTraffic;const residual=Math.log(Math.max(.001,observedShare)/Math.max(.001,f.shares[i]));const delta=.75*residual;after.appeal[id]=(after.appeal[id]??0)+delta;const j=(dayIndex%5)*4+i;after.dayBias[j]+=.12*residual;changes.push({name:DISHES.find(d=>d.id===id)!.name,delta});});}after.services++;const biggest=changes.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta))[0];const explanation=biggest?`${biggest.name}: appeal ${biggest.delta>=0?'+':''}${biggest.delta.toFixed(3)} log-score. Dish appeal updates by 0.75 × log(observed share / predicted share); this weekday’s station effect updates by 0.12 × the same residual. ${after.services} revealed services incorporated.`:`No choices were observed; appeal and weekday effects unchanged. Service count is now ${after.services}.`;const preparation=f.menu.map((id,i)=>id?count(options?.preparation?.[i]??f.portions[i]):0);const record:ServiceRecord={dayIndex,forecast:frozen,baseline:clone(baseline),...result,observedProfile,timingProvenance:"stored-before-reveal",mae:mae(frozen.portions,result.observed),baselineMae:mae(baseline.portions,result.observed),modelBefore:before,modelAfter:after,explanation,preparation,surplus:preparation.reduce((s,p,i)=>s+Math.max(0,p-result.observed[i]),0),unmet:preparation.reduce((s,p,i)=>s+Math.max(0,result.observed[i]-p),0)};return{version:1,model:after,records:[...clone(state.records),record]};}
export function weeklySummary(records:ServiceRecord[]){return Array.from({length:5},(_,i)=>{const r=records.filter(r=>Math.floor(r.dayIndex/5)===i);return{week:i+1,count:r.length,mae:r.length?r.reduce((s,r)=>s+r.mae,0)/r.length:null,baselineMae:r.length?r.reduce((s,r)=>s+r.baselineMae,0)/r.length:null};});}
/** Replace this implementation when real, validated models become available.
 * All data reaches the adapter explicitly; no network calls or background learning. */
export interface ForecastAdapter {
  initialState: typeof initialState;
  forecast: typeof forecast;
  simulate: typeof simulate;
  completeService: typeof completeService;
}
export const demonstrationAdapter: ForecastAdapter = {initialState, forecast, simulate, completeService};

const validCount=(n:unknown):n is number=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=10000;
const finiteArray=(v:unknown,length:number):v is number[]=>Array.isArray(v)&&v.length===length&&v.every(n=>typeof n==='number'&&Number.isFinite(n));
const countArray=(v:unknown):v is number[]=>finiteArray(v,4)&&v.every(validCount);
function validModel(m:unknown):m is Model {
 if(!m||typeof m!=='object')return false;
 const v=m as Model;
 return validCount(v.services)&&v.services<=25&&finiteArray(v.dayBias,20)&&v.appeal!==null&&typeof v.appeal==='object'&&DISHES.every(d=>typeof v.appeal[d.id]==='number'&&Number.isFinite(v.appeal[d.id]));
}
function sameModel(a:Model,b:Model){return a.services===b.services&&a.dayBias.every((n,i)=>n===b.dayBias[i])&&DISHES.every(d=>a.appeal[d.id]===b.appeal[d.id]);}
function validProfile(v:unknown,totals:number[]):v is number[][] {
 return Array.isArray(v)&&v.length===15&&v.every(countArray)&&v[0].every(n=>n===0)&&v[14].every((n,i)=>n===totals[i])&&v.every((row,step)=>step===0||row.every((n,i)=>n>=v[step-1][i]));
}
const sameProfile=(a:number[][],b:number[][])=>a.every((row,i)=>row.every((n,j)=>n===b[i][j]));
function validForecast(v:unknown):v is Forecast {
 if(!v||typeof v!=='object')return false;
 const f=v as Forecast;
 if(!Array.isArray(f.menu)||f.menu.length!==4||!f.menu.every((id,i)=>id===null||DISHES.some(d=>d.id===id&&d.stationId===STATIONS[i].id))||!validCount(f.traffic)||!countArray(f.portions)||!finiteArray(f.shares,4)||!validProfile(f.arrivalProfile,f.portions))return false;
 const active=f.menu.some(Boolean);
 return f.portions.reduce((a,b)=>a+b,0)===f.traffic&&f.shares.every((n,i)=>n>=0&&n<=1&&(f.menu[i]!==null||(n===0&&f.portions[i]===0)))&&Math.abs(f.shares.reduce((a,b)=>a+b,0)-(active?1:0))<1e-9&&(active||f.traffic===0);
}
const sameForecast=(a:Forecast,b:Forecast)=>a.traffic===b.traffic&&a.menu.every((id,i)=>id===b.menu[i])&&a.portions.every((n,i)=>n===b.portions[i])&&a.shares.every((n,i)=>n===b.shares[i])&&sameProfile(a.arrivalProfile,b.arrivalProfile);
/** Local storage is untrusted: reject the complete snapshot on malformed inner records. */
export function restoreState(raw:string|null):DemoState {
 if(!raw)return initialState();
 try {
  const s=JSON.parse(raw) as DemoState;
  if(!s||s.version!==1||!Array.isArray(s.records)||s.records.length>25||!validModel(s.model)||s.model.services!==s.records.length)return initialState();
  let previous=initialState().model;
  for(let i=0;i<s.records.length;i++){
   const r=s.records[i];
   // Only complete legacy records without any timing fields qualify for migration.
   // Existing totals, forecasts, outcomes and errors are never changed.
   if(r&&r.forecast&&r.baseline&&!Object.hasOwn(r.forecast,'arrivalProfile')&&!Object.hasOwn(r.baseline,'arrivalProfile')&&!Object.hasOwn(r,'observedProfile')&&!Object.hasOwn(r,'timingProvenance')&&countArray(r.forecast.portions)&&countArray(r.baseline.portions)&&countArray(r.observed)){
    r.forecast.arrivalProfile=predictedArrivalProfile(r.forecast.portions);
    r.baseline.arrivalProfile=predictedArrivalProfile(r.baseline.portions);
    r.observedProfile=observedArrivalProfile(r.observed,i);
    r.timingProvenance='reconstructed-legacy';
   }
   if(!r||r.dayIndex!==i||!validForecast(r.forecast)||!validForecast(r.baseline)||!countArray(r.observed)||!countArray(r.preparation)||!validCount(r.actualTraffic)||r.observed.reduce((a,b)=>a+b,0)!==r.actualTraffic||!validModel(r.modelBefore)||!validModel(r.modelAfter)||r.modelBefore.services!==i||r.modelAfter.services!==i+1||!sameModel(r.modelBefore,previous)||typeof r.explanation!=='string'||!validProfile(r.observedProfile,r.observed)||!sameProfile(r.observedProfile,observedArrivalProfile(r.observed,i))||!['stored-before-reveal','reconstructed-legacy'].includes(r.timingProvenance)||!Number.isFinite(r.mae)||!Number.isFinite(r.baselineMae)||!Number.isFinite(r.surplus)||!Number.isFinite(r.unmet))return initialState();
   if(!sameForecast(r.forecast,forecast(r.forecast.menu,r.forecast.traffic,r.modelBefore,i))||!sameForecast(r.baseline,forecast(r.forecast.menu,r.forecast.traffic,initialState().model,i))||r.mae!==mae(r.forecast.portions,r.observed)||r.baselineMae!==mae(r.baseline.portions,r.observed)||r.surplus!==r.preparation.reduce((n,p,j)=>n+Math.max(0,p-r.observed[j]),0)||r.unmet!==r.preparation.reduce((n,p,j)=>n+Math.max(0,r.observed[j]-p),0)||r.forecast.menu.some((id,j)=>id===null&&(r.preparation[j]!==0||r.observed[j]!==0)))return initialState();
   const expectedAfter=clone(r.modelBefore);
   if(r.actualTraffic>0)r.forecast.menu.forEach((id,j)=>{if(!id)return;const residual=Math.log(Math.max(.001,r.observed[j]/r.actualTraffic)/Math.max(.001,r.forecast.shares[j]));expectedAfter.appeal[id]+=.75*residual;expectedAfter.dayBias[(i%5)*4+j]+=.12*residual;});
   expectedAfter.services++;
   if(!sameModel(r.modelAfter,expectedAfter))return initialState();
   previous=r.modelAfter;
  }
  if(!sameModel(s.model,previous))return initialState();
  return clone(s);
 }catch{return initialState();}
}
