import React, { useMemo, useState } from 'react'

const PROVINCES = [
  'Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland'
]

function daysBetween(a,b){ if(!a||!b) return 0; const d1=new Date(a); const d2=new Date(b); const diff=(d2-d1)/(1000*60*60*24); return Math.max(0, Math.round(diff)) }
function euro(n){ return n.toLocaleString('nl-NL',{style:'currency',currency:'EUR'}) }

function generateIdeas({nights,persons,totalBudget,provinces}){
  if(!nights||!persons||!totalBudget||provinces.length===0) return []
  const pppn=totalBudget/persons/nights
  const coastal=provinces.some(p=>['Zeeland','Noord-Holland','Zuid-Holland','Friesland','Groningen'].includes(p))
  const nature=provinces.some(p=>['Drenthe','Gelderland','Limburg','Overijssel'].includes(p))
  const city=provinces.some(p=>['Utrecht','Zuid-Holland','Noord-Holland','Noord-Brabant'].includes(p))
  const tier=pppn>=150?'premium':pppn>=80?'comfort':'budget'
  const pool=[]
  if(coastal) pool.push({title:'Kustweekend – duinwandeling & strandpaviljoen', base:70, tags:['strand','wandelen',tier], blurb:'Knus hotel/B&B nabij duinen. Tips voor paviljoens en ochtendwandeling.'})
  if(nature) pool.push({title:'Natuur & Wellness – boslodge met sauna', base:85, tags:['wellness','natuur',tier], blurb:'Lodge aan de bosrand met (privé)sauna/hottub en bosroute.'})
  if(city) pool.push({title:'Stedentrip compact – foodmarket & musea', base:90, tags:['stad','cultuur',tier], blurb:'Centrale locatie, foodhall + twee musea en avondwandeling.'})
  if(pool.length===0) pool.push({title:'Weekend dichtbij huis – verrassingsroute', base:60, tags:['flexibel','rustig',tier], blurb:'Eenvoudig verblijf met lokale tips (koffie, lunch, wandeling).'})
  return pool.slice(0,3).map((p,idx)=>{ const estimated=Math.round(Math.min(totalBudget, p.base*persons*nights*(tier==='premium'?1.8: tier==='comfort'?1.3:1))); return {id:idx+'-'+p.title, ...p, estCost:estimated} })
}

// --- Datum helpers (keuze → from/to) ---
function toISO(d) {
  // yyyy-mm-dd
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString().slice(0,10);
}

function nextWeekday(date, weekday /* 0=zo..6=za */) {
  const d = new Date(date);
  const diff = (weekday + 7 - d.getDay()) % 7 || 7; // altijd vooruit, min. +1..+7
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function presetToRange(presetKey, now=new Date()) {
  // Geeft {fromISO, toISO, label} terug
  let from, to, label;

  switch (presetKey) {
    case "next-weekend": {
      // vr (check-in) → zo (check-out) = 2 nachten
      const nextFri = nextWeekday(now, 5);
      const nextSun = nextWeekday(now, 0); // zondag
      // Zorg dat zo ná vr valt (als zondag eerder is, pak zondag na die vrijdag)
      if (nextSun <= nextFri) nextSun = addDays(nextSun, 7);
      from = nextFri;
      to   = nextSun;
      label = "Volgend weekend (vr–zo)";
      break;
    }
    case "this-weekend": {
      // als we al voorbij zo zijn: val terug op volgend weekend
      let fri = nextWeekday(addDays(now, -7), 5);
      while (fri <= now) fri = addDays(fri, 7);
      let sun = nextWeekday(addDays(now, -7), 0);
      while (sun <= fri) sun = addDays(sun, 7);
      from = fri; to = sun;
      label = "Dit weekend (vr–zo)";
      break;
    }
    case "two-weeks": {
      const baseFri = addDays(nextWeekday(now, 5), 7); // vrijdag over 2 weken
      from = baseFri;
      to   = addDays(baseFri, 2); // tot zondag
      label = "Over 2 weken (vr–zo)";
      break;
    }
    case "long-weekend": {
      // do (check-in) → zo (check-out) = 3 nachten
      const nextThu = nextWeekday(now, 4);
      from = nextThu;
      to   = addDays(nextThu, 3);
      label = "Lang weekend (do–zo)";
      break;
    }
    case "midweek": {
      // ma (check-in) → vr (check-out) = 4 nachten
      const nextMon = nextWeekday(now, 1);
      from = nextMon;
      to   = addDays(nextMon, 4);
      label = "Midweek (ma–vr)";
      break;
    }
    default:
      return null;
  }

  return { fromISO: toISO(from), toISO: toISO(to), label };
}


export default function App(){
  const [from,setFrom]=useState(''); const [to,setTo]=useState(''); const [budget,setBudget]=useState(''); const [persons,setPersons]=useState(2); const [selectedProvinces,setSelectedProvinces]=useState([]); const [submitted,setSubmitted]=useState(false)

  const nights=useMemo(()=>daysBetween(from,to),[from,to]); const totalBudget=Number(budget||0)
  const ideas=useMemo(()=>generateIdeas({nights,persons,totalBudget,provinces:selectedProvinces}),[nights,persons,totalBudget,selectedProvinces])

  const toggleProvince=p=> setSelectedProvinces(prev=> prev.includes(p)? prev.filter(x=>x!==p):[...prev,p])
  const submit=e=>{ e.preventDefault(); setSubmitted(true) }

  return (
    <div className='container'>
      <div className='card'>
        <h1 className='h1'>Weekendje Weg – Quick Planner (MVP)</h1>
        <form onSubmit={submit} className='grid'>
          <div className='grid grid2'>
            <div>
  <label>Periode</label>
  <select
    className='select'
    defaultValue=""
    onChange={(e) => {
      const v = e.target.value;
      if (!v) return;
      const range = presetToRange(v);
      if (range) {
        setFrom(range.fromISO);
        setTo(range.toISO);
        setSubmitted(false); // reset resultaten bij wisselen
      }
    }}
  >
    <option value="" disabled>Kies een periode…</option>
    <option value="this-weekend">Dit weekend (vr–zo)</option>
    <option value="next-weekend">Volgend weekend (vr–zo)</option>
    <option value="two-weeks">Over 2 weken (vr–zo)</option>
    <option value="long-weekend">Lang weekend (do–zo)</option>
    <option value="midweek">Midweek (ma–vr)</option>
  </select>
  <p className="helper" style={{marginTop:6}}>
    Gekozen data: {from && to ? `${from} t/m ${to} (${daysBetween(from,to)} nacht${daysBetween(from,to)===1?'':'en'})` : '—'}
  </p>
</div>

          </div>
          <div>
            <label>Budget</label>
            <input className='number' type='number' value={budget} onChange={e=>setBudget(e.target.value)} placeholder='Bijv. 600' />
          </div>
          <div>
            <label>Personen</label>
            <input className='number' type='number' value={persons} onChange={e=>setPersons(Number(e.target.value))} />
          </div>
          <div>
            <label>Provincies</label>
            <div className='card' style={{maxHeight:160, overflow:'auto'}}>
              {PROVINCES.map(p=> (
                <label key={p} style={{display:'flex', gap:8, alignItems:'center', padding:'6px 4px'}}>
                  <input type='checkbox' checked={selectedProvinces.includes(p)} onChange={()=>toggleProvince(p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <button className='btn' type='submit'>Genereer ideeën</button>
        </form>
      </div>

      {submitted && (
        <div className='list' style={{marginTop:16}}>
          {ideas.map(idea=> (
            <div key={idea.id} className='idea'>
              <div className='badge'>{idea.tags.join(' · ')}</div>
              <h3 style={{margin:'8px 0'}}>{idea.title}</h3>
              <p style={{opacity:.9}}>{idea.blurb}</p>
              <p className='price' style={{marginTop:8}}>{euro(idea.estCost)}</p>
            </div>
          ))}
          {ideas.length===0 && <div className='card'>Vul alle velden in om ideeën te genereren.</div>}
        </div>
      )}
    </div>
  )
}
