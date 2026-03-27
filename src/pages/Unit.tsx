/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { api } from "../services/api"
import CreateUnidadeModal from "../components/modals/CreateUnidadeModal"

export default function Unidades(){

 const [data,setData] = useState<any[]>([])
 const [open,setOpen] = useState(false)

 const load = async ()=>{
  const res = await api.get("/unidades")
  setData(res.data)
  console.log('MUNI', res.data)
 }

 useEffect(()=>{
  load()
 },[])

 return(

  <div style={styles.container}>

    <div style={styles.header}>
      <h2>Unidades</h2>

      <button style={styles.btn} onClick={()=>setOpen(true)}>
        Nova Unidade
      </button>
    </div>

    <div style={styles.card}>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Município</th>
          </tr>
        </thead>

        <tbody>
          {data.map((u:any)=>(
            <tr key={u.id}>
              <td align="center">{u.name}</td>
              <td align="center">{u.municipality?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>

    <CreateUnidadeModal
      isOpen={open}
      onClose={()=>setOpen(false)}
      onCreated={load}
    />

  </div>

 )

}

const styles:any = {
 container:{ padding:30 },
 header:{ display:"flex", justifyContent:"space-between", marginBottom:20 },
 card:{ background:"#fff", padding:20, borderRadius:10 },
 table:{ width:"100%" },
 btn:{ background:"#10b981", color:"#fff", padding:10, borderRadius:8 }
}