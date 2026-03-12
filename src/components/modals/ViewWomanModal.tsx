/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { api } from "../../services/api"

export default function ViewWomanModal({ isOpen, onClose, woman }: any) {

 const [reports,setReports] = useState([])
 const [emotions,setEmotions] = useState([])
 const [tab,setTab] = useState("reports")

 useEffect(()=>{

  if(woman){
   loadData()
  }

 },[woman])

 const loadData = async () => {

  const reportsRes = await api.get(`/reports/${woman.id}`)
  const emotionsRes = await api.get(`/daily-emotions/${woman.id}`)

  setReports(reportsRes.data)
  setEmotions(emotionsRes.data)

 }

 const calculateEmotionScore = ()=>{

  const weights:any = {
   BEM:0,
   TRISTE:1,
   PREOCUPADA:2,
   CHORANDO:3,
   MEDO:4,
   ANSIEDADE:3,
   SOLIDAO:3,
   PERIGO:5
  }

  let total = 0

  emotions.forEach((e:any)=>{
   total += weights[e.emotion] || 0
  })

  const max = emotions.length * 5

  const percentage = max ? Math.round((total/max)*100) : 0

  return percentage

 }

 const risk = calculateEmotionScore()

 if(!isOpen) return null

 return(

  <div style={styles.overlay}>

   <div style={styles.modal}>

    {/* HEADER */}

    <div style={styles.header}>

     <div>
      <h2 style={styles.name}>{woman.name}</h2>
      <span style={styles.subtitle}>
       {woman.municipality?.name}
      </span>
     </div>

     <button style={styles.close} onClick={onClose}>
      ✕
     </button>

    </div>

    {/* DADOS */}

    <div style={styles.infoGrid}>
     <div style={styles.infoCard}>
      <span className="label">CPF: </span>
      <b>{woman.cpf}</b>
     </div>

     <div style={styles.infoCard}>
      <span className="label">Município: </span>
      <b>{woman.municipality?.name}</b>
     </div>

     <div style={styles.infoCard}>
      <span className="label">Risco emocional</span>

      <div style={styles.riskBar}>
       <div
        style={{
         ...styles.riskFill,
         width:`${risk}%`
        }}
       />
      </div>

      <small>{risk}%</small>

     </div>

    </div>

    {/* TABS */}

    <div style={styles.tabs}>

     <button
      style={tab === "reports" ? styles.tabActive : styles.tab}
      onClick={()=>setTab("reports")}
     >
      Fatos
     </button>

     <button
      style={tab === "emotions" ? styles.tabActive : styles.tab}
      onClick={()=>setTab("emotions")}
     >
      Emoções
     </button>

    </div>

    {/* CONTEÚDO */}

    <div style={styles.content}>

     {tab === "reports" && (

      <div>

       {reports.length === 0 && (
        <p style={styles.empty}>
         Nenhum fato registrado
        </p>
       )}

       {reports.map((r:any)=>(
        <div key={r.id} style={styles.reportCard}>

         <div style={styles.reportDate}>
          {new Date(r.createdAt).toLocaleDateString("pt-BR")}
         </div>

         <p>{r.description}</p>

        </div>
       ))}

      </div>

     )}

     {tab === "emotions" && (

      <div>

       {emotions.length === 0 && (
        <p style={styles.empty}>
         Nenhuma emoção registrada
        </p>
       )}

       {emotions.map((e:any)=>(
        <div key={e.id} style={styles.emotionCard}>

         <span>{e.emotion}</span>

         <span style={styles.date}>
          {new Date(e.createdAt).toLocaleDateString("pt-BR")}
         </span>

        </div>
       ))}

      </div>

     )}

    </div>

   </div>

  </div>

 )

}

const styles:any = {

 overlay:{
  position:"fixed",
  top:0,
  left:0,
  width:"100%",
  height:"100%",
  background:"rgba(0,0,0,0.45)",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  zIndex:1000
 },

 modal:{
  width:"85%",
  maxWidth:900,
  maxHeight:"90vh",
  background:"#fff",
  borderRadius:12,
  padding:30,
  overflowY:"auto",
  boxShadow:"0 10px 35px rgba(0,0,0,0.15)"
 },

 header:{
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:25
 },

 name:{
  margin:0,
  fontSize:22
 },

 subtitle:{
  color:"#6b7280"
 },

 close:{
  background:"transparent",
  border:"none",
  fontSize:20,
  cursor:"pointer"
 },

 infoGrid:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
  gap:15,
  marginBottom:25
 },

 infoCard:{
  background:"#f9fafb",
  padding:15,
  borderRadius:8
 },

 riskBar:{
  height:6,
  background:"#e5e7eb",
  borderRadius:5,
  marginTop:8
 },

 riskFill:{
  height:6,
  background:"#ef4444",
  borderRadius:5
 },

 tabs:{
  display:"flex",
  gap:10,
  marginBottom:20
 },

 tab:{
  padding:"8px 16px",
  border:"1px solid #e5e7eb",
  borderRadius:6,
  background:"#fff",
  cursor:"pointer"
 },

 tabActive:{
  padding:"8px 16px",
  borderRadius:6,
  background:"#ec4899",
  color:"#fff",
  border:"none"
 },

 content:{
  minHeight:200
 },

 reportCard:{
  background:"#f9fafb",
  padding:15,
  borderRadius:8,
  marginBottom:12
 },

 reportDate:{
  fontSize:12,
  color:"#6b7280",
  marginBottom:5
 },

 emotionCard:{
  display:"flex",
  justifyContent:"space-between",
  background:"#f9fafb",
  padding:12,
  borderRadius:8,
  marginBottom:10
 },

 date:{
  color:"#6b7280",
  fontSize:12
 },

 empty:{
  color:"#9ca3af"
 }

}