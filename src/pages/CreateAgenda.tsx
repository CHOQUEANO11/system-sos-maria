/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function CreateAgenda(){

  const { user } = useAuth()

 const [women,setWomen] = useState([])
 const [militares,setMilitares] = useState([])

 const [woman,setWoman] = useState<any>(null)
 const [selectedMilitares,setSelectedMilitares] = useState<any[]>([])

 const [searchWoman,setSearchWoman] = useState("")
 const [searchPolice,setSearchPolice] = useState("")

 const [date,setDate] = useState("")
 const [time,setTime] = useState("")

 useEffect(()=>{
  loadData()
 },[])

 const loadData = async ()=>{

  

const [w,m] = await Promise.all([
  api.get("/users",{ params:{ role:"WOMAN" } }),
  api.get("/police",{
    params:{
      unidadeId: user?.unidadeId
    }
  })
])

  setWomen(w.data.data)
  setMilitares(m.data)

 }

 // 🔎 FILTROS
 const filteredWomen = women.filter((w:any)=>
  w.name.toLowerCase().includes(searchWoman.toLowerCase()) ||
  w.cpf?.includes(searchWoman) ||
  w.rg?.includes(searchWoman)
 )

 const filteredPolice = militares.filter((m:any)=>
  m.user?.name.toLowerCase().includes(searchPolice.toLowerCase()) ||
  m.user?.cpf?.includes(searchPolice)
 )

 const handleSelectWoman = (w:any)=>{
  setWoman(w)
 }

 const toggleMilitar = (m:any)=>{

  const exists = selectedMilitares.find(x=>x.id === m.id)

  if(exists){
    setSelectedMilitares(prev=>prev.filter(x=>x.id !== m.id))
  }else{
    setSelectedMilitares(prev=>[...prev,m])
  }

 }

 const handleSubmit = async ()=>{

  await api.post("/agenda",{
    womanId: woman.id,
    militares: selectedMilitares.map(m=>m.id),
    date: new Date(`${date}T${time}`)
  })

  alert("Agenda criada com sucesso")

 }

 return(

  <div style={styles.container}>

    <h2 style={styles.title}>Criar Agenda</h2>

    {/* 🔎 BUSCA MULHER */}
    <input
      placeholder="Buscar mulher por nome, CPF ou RG..."
      style={styles.search}
      onChange={e=>setSearchWoman(e.target.value)}
    />

    <div style={styles.selectBox}>

      {filteredWomen.map((w:any)=>(
        <div
          key={w.id}
          style={{
            ...styles.option,
            background: woman?.id === w.id ? "#fce7f3" : "#fff"
          }}
          onClick={()=>handleSelectWoman(w)}
        >
          <strong>{w.name}</strong>
          <span>{w.cpf}</span>
        </div>
      ))}

    </div>

    {/* 👩 DADOS */}
    {woman && (
      <div style={styles.card}>
        <p><b>Nome:</b> {woman.name}</p>
        <p><b>Telefone:</b> {woman.phone}</p>
        <p><b>Endereço:</b> {woman.address}</p>
      </div>
    )}

    {/* 🔎 BUSCA POLICE */}
    <h3 style={styles.subtitle}>Selecionar Militares</h3>

    <input
      placeholder="Buscar policial..."
      style={styles.search}
      onChange={e=>setSearchPolice(e.target.value)}
    />

    <div style={styles.list}>

      {filteredPolice.map((m:any)=>{

        const selected = selectedMilitares.find(x=>x.id === m.id)

        return(

          <div
            key={m.id}
            style={{
              ...styles.policeCard,
              border: selected ? "2px solid #6366f1" : "1px solid #eee",
              background: selected ? "#eef2ff" : "#fff"
            }}
            onClick={()=>toggleMilitar(m)}
          >

            <strong>{m.user?.name}</strong>

            <span>{m.graduacao?.name}</span>

          </div>

        )

      })}

    </div>

    {/* 👮 ESCALADOS */}
    {selectedMilitares.length > 0 && (
      <>
        <h3 style={styles.subtitle}>Escala</h3>

        <div style={styles.chips}>

          {selectedMilitares.map(m=>(
            <span key={m.id} style={styles.chip}>
              {m.user?.name}
            </span>
          ))}

        </div>
      </>
    )}

    {/* 📅 DATA */}
    <div style={styles.dateRow}>
      <input type="date" style={styles.input} onChange={e=>setDate(e.target.value)}/>
      <input type="time" style={styles.input} onChange={e=>setTime(e.target.value)}/>
    </div>

    <button style={styles.button} onClick={handleSubmit}>
      Criar Agenda
    </button>

  </div>

 )

}

const styles:any = {

 container:{
  padding:30,
  maxWidth:900,
  margin:"0 auto"
 },

 title:{
  fontSize:22,
  marginBottom:20
 },

 subtitle:{
  marginTop:25,
  marginBottom:10
 },

 search:{
  width:"100%",
  padding:12,
  borderRadius:8,
  border:"1px solid #ddd",
  marginBottom:10
 },

 selectBox:{
  maxHeight:200,
  overflowY:"auto",
  border:"1px solid #eee",
  borderRadius:10
 },

 option:{
  padding:12,
  borderBottom:"1px solid #f1f5f9",
  cursor:"pointer",
  display:"flex",
  justifyContent:"space-between"
 },

 card:{
  marginTop:15,
  padding:15,
  background:"#f9fafb",
  borderRadius:10
 },

 list:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
  gap:10
 },

 policeCard:{
  padding:12,
  borderRadius:10,
  cursor:"pointer",
  display:"flex",
  flexDirection:"column"
 },

 chips:{
  display:"flex",
  flexWrap:"wrap",
  gap:8
 },

 chip:{
  background:"#6366f1",
  color:"#fff",
  padding:"6px 12px",
  borderRadius:20,
  fontSize:12
 },

 dateRow:{
  display:"flex",
  gap:10,
  marginTop:20,
  flexWrap:"wrap"
 },

 input:{
  flex:1,
  padding:10,
  borderRadius:8,
  border:"1px solid #ddd"
 },

 button:{
  marginTop:20,
  width:"100%",
  padding:14,
  background:"#10b981",
  color:"#fff",
  border:"none",
  borderRadius:10,
  fontWeight:"bold",
  cursor:"pointer"
 }

}