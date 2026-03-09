/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

type CardProps = {
 title: string
 value: string | number
}

export default function Dashboard(){

  const { user } = useAuth()

  const [stats,setStats] = useState({
    women:0,
    admins:0,
    emergencies:0,
    resolved:0
  })

  const [chart,setChart] = useState<any[]>([])
  const [statusChart,setStatusChart] = useState<any[]>([])
  const [adminsChart,setAdminsChart] = useState<any[]>([])

  const loadDashboard = async () => {

    try{

      const params:any = {}

      // regra de município
      if(user?.role !== "SUPER_ADMIN"){
        params.municipalityId = user?.municipalityId
      }

      const [
        womenRes,
        adminsRes,
        emergenciesRes
      ] = await Promise.all([

        api.get("/users",{
          params:{ role:"WOMAN", ...params }
        }),

        api.get("/users",{
          params:{ role:"ADMIN", ...params }
        }),

        api.get("/emergencies",{ params })

      ])

      const women = womenRes.data.data || []
      const admins = adminsRes.data.data || []
      const emergencies = emergenciesRes.data.data || []

      const resolved = emergencies.filter(
        (e:any)=> e.status === "RESOLVED"
      )

      setStats({
        women:women.length,
        admins:admins.length,
        emergencies:emergencies.length,
        resolved:resolved.length
      })

      /* =========================
         GRÁFICO DE CASOS POR MÊS
      ========================= */

      const months:any = {}

      emergencies.forEach((e:any)=>{

        const date = new Date(e.createdAt)

        const month = date.toLocaleString("pt-BR",{ month:"short" })

        if(!months[month]){
          months[month] = 0
        }

        months[month]++

      })

      const chartData = Object.keys(months).map((m)=>({
        name:m,
        casos:months[m]
      }))

      setChart(chartData)

      /* =========================
         STATUS DAS EMERGÊNCIAS
      ========================= */

      const pending = emergencies.filter(
        (e:any)=> e.status === "PENDING"
      ).length

      const resolvedCount = emergencies.filter(
        (e:any)=> e.status === "RESOLVED"
      ).length

      setStatusChart([
        { name:"Pendentes", value:pending },
        { name:"Resolvidos", value:resolvedCount }
      ])

      /* =========================
         ADMINS POR MUNICÍPIO
      ========================= */

      if(user?.role === "SUPER_ADMIN"){

        const municipalities:any = {}

        admins.forEach((a:any)=>{

          const m = a.municipality?.name || "Sem município"

          if(!municipalities[m]){
            municipalities[m] = 0
          }

          municipalities[m]++

        })

        const adminsData = Object.keys(municipalities).map((m)=>({
          name:m,
          admins:municipalities[m]
        }))

        setAdminsChart(adminsData)

      }

    }catch(error){

      console.log("Erro ao carregar dashboard",error)

    }

  }

  useEffect(()=>{
    loadDashboard()
  },[])

  return(

    <div style={{width:"100%"}}>

      <h2 style={{marginBottom:20}}>
        Dashboard
      </h2>

      {/* BOTÃO IMPRIMIR */}

      <button
        onClick={()=>window.print()}
        style={styles.printBtn}
      >
        Imprimir relatório
      </button>

      {/* CARDS */}

      <div style={styles.cards}>

        <Card title="Mulheres cadastradas" value={stats.women}/>
        <Card title="Admins" value={stats.admins}/>
        <Card title="Pedidos de ajuda" value={stats.emergencies}/>
        <Card title="Chamados atendidos" value={stats.resolved}/>

      </div>

      {/* GRAFICO MENSAL */}

      <div style={styles.chartCard}>

        <h3>Emergências por mês</h3>

        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={chart}>

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="casos" fill="#ec4899" />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* STATUS EMERGÊNCIAS */}

      <div style={styles.chartCard}>

        <h3>Status das emergências</h3>

        <ResponsiveContainer width="100%" height={300}>

          <PieChart>

            <Pie
              data={statusChart}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >

              <Cell fill="#ef4444"/>
              <Cell fill="#10b981"/>

            </Pie>

            <Legend/>

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* ADMINS POR MUNICÍPIO */}

      {user?.role === "SUPER_ADMIN" && (

        <div style={styles.chartCard}>

          <h3>Admins por município</h3>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={adminsChart}>

              <XAxis dataKey="name"/>

              <YAxis/>

              <Tooltip/>

              <Bar dataKey="admins" fill="#6366f1"/>

            </BarChart>

          </ResponsiveContainer>

        </div>

      )}

    </div>

  )

}

const Card = ({ title, value }: CardProps) => {

  return(

    <div style={styles.card}>

      <p style={{color:"#6b7280"}}>
        {title}
      </p>

      <h2 style={styles.cardValue}>
        {value}
      </h2>

    </div>

  )

}

const styles:any = {

  cards:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
    gap:20,
    marginBottom:30
  },

  card:{
    background:"#fff",
    padding:20,
    borderRadius:12,
    boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
  },

  cardValue:{
    color:"#ec4899",
    marginTop:10
  },

  chartCard:{
    background:"#fff",
    padding:30,
    borderRadius:12,
    boxShadow:"0 4px 10px rgba(0,0,0,0.05)",
    marginTop:30
  },

  printBtn:{
    background:"#111",
    color:"#fff",
    padding:"10px 18px",
    borderRadius:8,
    border:"none",
    marginBottom:20,
    cursor:"pointer"
  }

}