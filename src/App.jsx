import React, { useMemo, useState } from 'react'

const PROVINCES = [
  'Drenthe','Flevoland','Friesland','Gelderland','Groningen','Limburg','Noord-Brabant','Noord-Holland','Overijssel','Utrecht','Zeeland','Zuid-Holland'
]

function daysBetween(a,b){
  if(!a||!b) return 0
  const d1=new Date(a); const d2=new Date(b)
  const diff=(d2.getTime()-d1.getTime())/(1000*60*60*24)
  return Math.max(0,Math.round(diff))
}

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
  return pool.slice(0,3).map((p,idx)=>{
    const estimated=Math.round(Math.min(totalBudget, p.base*persons*nights*(tier==='premium'?1.8: tier==='comfort'?1.3:1)))
    return {id:idx+'-'+p.title,title:p.title,blurb:p.blurb,tags:p.tags,estCost:estimated}
  })
}

export default function App(){
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  const [budget,setBudget]=useState('')
  const [persons,setPersons]=useState(2)
  const [selectedProvinces,setSelectedProvinces]=useState([])
  const [submitted,setSubmitted]=useState(false)

  const nights=useMemo(()=>daysBetween(from,to),[from,to])
  const totalBudget=Number(budget||0)
  const ideas=useMemo(()=>generateIdeas({nights,persons,totalBudget,provinces:selectedProvinces}),[nights,persons,totalBudget,selectedProvinces])

  function toggleProvince(p){ setSelectedProvinces(prev=> prev.includes(p)? prev.filter(x=>x!==p):[...prev,p]) }
  function handleSubmit(e){ e.preventDefault(); setSubmitted(true) }

  return (
    <div className='min-h-screen p-6 bg-gradient-to-b from-slate-950 to-slate-900'>
      <div className='max-w-6xl mx-auto text-slate-100'>
        <h1 className='text-3xl md:text-4xl font-semibold mb-2'>Weekendje Weg – Quick Planner (MVP)</h1>
        <form onSubmit={handleSubmit} className='space-y-4 bg-slate-950/50 border border-slate-800 rounded-2xl p-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div><label>Van</label><input type='date' value={from} onChange={e=>setFrom(e.target.value)} className='w-full bg-slate-900 border border-slate-800 rounded px-3 py-2'/></div>
            <div><label>Tot</label><input type='date' value={to} onChange={e=>setTo(e.target.value)} className='w-full bg-slate-900 border border-slate-800 rounded px-3 py-2'/></div>
          </div>
          <div><label>Budget</label><input type='number' value={budget} onChange={e=>setBudget(e.target.value)} className='w-full bg-slate-900 border border-slate-800 rounded px-3 py-2'/></div>
          <div><label>Personen</label><input type='number' value={persons} onChange={e=>setPersons(Number(e.target.value))} className='w-full bg-slate-900 border border-slate-800 rounded px-3 py-2'/></div>
          <div>
            <label>Provincies</label>
            <div className='grid grid-cols-2 border border-slate-800 rounded max-h-40 overflow-auto'>
              {PROVINCES.map(p=>(<label key={p} className='flex items-center gap-2 px-2 py-1'>
                <input type='checkbox' checked={selectedProvinces.includes(p)} onChange={()=>toggleProvince(p)}/> {p}
              </label>))}
            </div>
          </div>
          <button type='submit' className='w-full bg-slate-100 text-slate-900 rounded px-3 py-2 font-medium'>Genereer ideeën</button>
        </form>
        {submitted && <div className='grid md:grid-cols-3 gap-4 mt-4'>
          {ideas.map(idea=>(<div key={idea.id} className='bg-slate-950/50 border border-slate-800 rounded-2xl p-4'>
            <h3 className='text-lg font-semibold mb-1'>{idea.title}</h3>
            <p className='text-sm text-slate-300'>{idea.blurb}</p>
            <p className='mt-2 font-semibold'>{euro(idea.estCost)}</p>
          </div>))}
        </div>}
      </div>
    </div>
  )
}
