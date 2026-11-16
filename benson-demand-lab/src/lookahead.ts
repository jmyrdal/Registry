import {DAYS, STATIONS, ARRIVAL_WEIGHTS, clockLabel, forecast, seeded, simulate, type Forecast, type Model, type ServiceRecord} from './engine';

export interface LookaheadPoint {
  label: string;
  description: string;
  expected: number;
  band: [number, number];
  capacity: number;
  [key: string]: string | number | [number, number];
}
export const PATH_COUNT = 32;
const pick = (row: number[], station: number) => station < 0 ? row.reduce((a,b)=>a+b,0) : row[station];
const quantile = (values: number[], q: number) => [...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*q))] || 0;

/** Synthetic arrival timing only; endpoint demand comes from the existing coherent samples. */
export function lunchLookahead(f: Forecast, model: Model, dayIndex: number, quantities: number[], station: number): LookaheadPoint[] {
  const samples = simulate(f, model, dayIndex).samples;
  const trajectories = samples.map((totals, index) => {
    const rng = seeded(48023 + dayIndex*401 + index*131);
    const weights = ARRIVAL_WEIGHTS.map(w=>w*(.5+rng()));
    const denominator = weights.reduce((a,b)=>a+b,0);
    let elapsed = 0;
    return [0, ...weights.map(w=>{elapsed+=w;return station<0?totals.reduce((sum,n)=>sum+Math.round(n*elapsed/denominator),0):Math.round(pick(totals,station)*elapsed/denominator);})];
  });
  return Array.from({length:15}, (_, step) => {
    const minutes = 11*60+step*15;
    const hour = Math.floor(minutes/60);
    const label = `${hour>12?hour-12:hour}:${String(minutes%60).padStart(2,'0')}`;
    const values = trajectories.map(path=>path[step]);
    const point:LookaheadPoint={label,description:`${label} ${hour>=12?'p.m.':'a.m.'} · cumulative portions`,expected:pick(f.arrivalProfile[step],station),band:[quantile(values,.1),quantile(values,.9)],capacity:pick(quantities,station)};
    for(let path=0;path<PATH_COUNT;path++)point[`path${path}`]=trajectories[path][step];
    return point;
  });
}

/** Known fictional menus only. One frozen model throughout; never reads future outcomes or trains. */
export function serviceLookahead(f:Forecast, model:Model, dayIndex:number, quantities:number[], station:number):LookaheadPoint[]{
  return DAYS.slice(dayIndex,dayIndex+5).map((day,offset)=>{
    const daily=offset===0?f:forecast(day.menu,day.traffic,model,day.index);
    const samples=simulate(daily,model,day.index).samples;
    const values=samples.map(v=>pick(v,station));
    const point:LookaheadPoint={label:offset===0?'Today':`+${offset} lunch${offset===1?'':'es'}`,description:day.label,expected:pick(daily.portions,station),band:offset===0?[pick(daily.portions,station),pick(daily.portions,station)]:[quantile(values,.1),quantile(values,.9)],capacity:offset===0?pick(quantities,station):NaN};
    for(let path=0;path<PATH_COUNT;path++)point[`path${path}`]=offset===0?pick(daily.portions,station):values[path];
    return point;
  });
}

export interface ComparisonPoint {label:string;description:string;predicted:number;observed:number;baseline:number;error:number}
/** Completed records only. All-station timeline is total cumulative portions, not mean station error. */
export function serviceComparison(record:ServiceRecord|undefined,station:number):ComparisonPoint[]{
 if(!record)return [];
 return record.observedProfile.map((row,step)=>{const predicted=pick(record.forecast.arrivalProfile[step],station),observed=pick(row,station);return{label:clockLabel(step),description:`${clockLabel(step)} · cumulative primary selections`,predicted,observed,baseline:pick(record.baseline.arrivalProfile[step],station),error:Math.abs(predicted-observed)};});
}
export interface DailyErrorPoint {day:number;week:number;label:string;adaptive:number;baseline:number;history:number}
/** All stations = average of the four station absolute errors. Single station = its absolute error. */
export function dailyErrors(records:ServiceRecord[],station:number):DailyErrorPoint[]{return records.map(r=>({day:r.dayIndex+1,week:Math.floor(r.dayIndex/5)+1,label:DAYS[r.dayIndex].label,adaptive:station<0?r.mae:Math.abs(r.forecast.portions[station]-r.observed[station]),baseline:station<0?r.baselineMae:Math.abs(r.baseline.portions[station]-r.observed[station]),history:r.modelBefore.services}));}
export function dailyErrorLabel(station:number){return station<0?'Mean absolute error · portions / station':`Absolute error · ${STATIONS[station].name} portions`;}
/** 14 post-opening checkpoints: excludes the guaranteed zero at 11:00 a.m. */
export function profileMae(record:ServiceRecord,station:number){const rows=serviceComparison(record,station).slice(1);return rows.reduce((sum,r)=>sum+r.error,0)/rows.length;}
