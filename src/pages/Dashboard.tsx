import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const data = [
 { name: "Jan", casos: 5 },
 { name: "Fev", casos: 8 },
 { name: "Mar", casos: 3 }
]

export default function Dashboard(){

  return(

    <div style={{width:"100%"}}>

      <h2 style={{marginBottom:20}}>Dashboard</h2>

      {/* CARDS */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap:20,
          marginBottom:30
        }}
      >

        <Card title="Mulheres cadastradas" value="120"/>
        <Card title="Admins" value="8"/>
        <Card title="Pedidos de ajuda" value="15"/>
        <Card title="Casos resolvidos" value="30"/>

      </div>

      {/* GRAFICO */}

      <div
  style={{
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    width: "100%"
  }}
>

  <ResponsiveContainer width="100%" height={300}>

    <BarChart data={data}>

      <XAxis dataKey="name" />

      <YAxis />

      <Tooltip />

      <Bar dataKey="casos" fill="#ec4899" />

    </BarChart>

  </ResponsiveContainer>

</div>

    </div>

  )

}

function Card({title,value}){

  return(

    <div
      style={{
        background:"#fff",
        padding:20,
        borderRadius:12,
        boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
      }}
    >

      <p style={{color:"#6b7280"}}>{title}</p>

      <h2 style={{color:"#ec4899",marginTop:10}}>{value}</h2>

    </div>

  )

}