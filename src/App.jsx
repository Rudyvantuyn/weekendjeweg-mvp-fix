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
              <label>Van</label>
              <input className='date' type='date' value={from} onChange={e=>setFrom(e.target.value)} />
            </div>
            <div>
              <label>Tot</label>
              <input className='date' type='date' value={to} onChange={e=>setTo(e.target.value)} />
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
