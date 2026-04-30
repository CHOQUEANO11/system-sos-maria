/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react"
import { api } from "../services/api"

export default function DashboardPolice(){

  const [stats,setStats] = useState({
    agendas:0,
    atendimentos:0,
    pendentes:0
  })

  const load = async () => {

    try{

      const [agendasRes, atendimentosRes] = await Promise.all([
        api.get("/agenda/police"),
        api.get("/appointment/atendimentos")
      ])

      const agendas = agendasRes.data || []
      const atendimentos = atendimentosRes.data || []

      setStats({
        agendas: agendas.length,
        atendimentos: atendimentos.length,
        pendentes: agendas.length
      })

    }catch(err){
      console.log(err)
    }
  }

  useEffect(()=>{
    load()
  },[])

  return(

    <div>

      <h2>Dashboard do Policial</h2>

      <div style={styles.cards}>

        <Card title="Visitas pendentes" value={stats.pendentes}/>
        <Card title="Total de agendas" value={stats.agendas}/>
        <Card title="Atendimentos realizados" value={stats.atendimentos}/>

      </div>

    </div>

  )

}

const Card = ({ title, value }: any) => (
  <div style={styles.card}>
    <p>{title}</p>
    <h2>{value}</h2>
  </div>
)

const styles:any = {
  cards:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
    gap:20
  },
  card:{
    background:"#fff",
    padding:20,
    borderRadius:12
  }
}