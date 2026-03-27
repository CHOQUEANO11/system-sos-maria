/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Plus } from "lucide-react"
import CreatePoliceModal from "../components/modals/CreatePoliceModal"

export default function Police(){

 const { user } = useAuth()

 const [police,setPolice] = useState<any[]>([])
 const [loading,setLoading] = useState(false)

 const [page,setPage] = useState(1)
 const limit = 10

 const [open,setOpen] = useState(false)

 const loadPolice = async () => {

  try{

    setLoading(true)

    const params:any = {
      role:"POLICE",
      page,
      limit
    }

    if(user?.role !== "SUPER_ADMIN"){
      params.municipalityId = user?.municipalityId
    }

    const res = await api.get("/users",{ params })

    setPolice(res.data.data)

  }catch(e){
    console.log(e)
  }finally{
    setLoading(false)
  }

 }

 useEffect(()=>{
  loadPolice()
 },[page])

 return(

  <div>

   <div style={styles.header}>

    <h2>Efetivo Policial</h2>

    <button style={styles.primaryBtn} onClick={()=>setOpen(true)}>
      <Plus size={18}/> Novo Policial
    </button>

   </div>

   <div style={styles.card}>

    <table style={styles.table}>

      <thead>
        <tr>
          <th>Nome</th>
          <th>CPF</th>
          <th>Unidade</th>
          <th>Graduação</th>
        </tr>
      </thead>

      <tbody>

        {loading && (
          <tr><td colSpan={4}>Carregando...</td></tr>
        )}

        {!loading && police.map((p:any)=>(
          <tr key={p.id}>
            <td align="center">{p.name}</td>
            <td align="center">{p.cpf}</td>
            <td align="center">{p.policeProfile?.unidade?.name}</td>
            <td align="center">{p.policeProfile?.graduacao?.name}</td>
          </tr>
        ))}

      </tbody>

    </table>

    <div style={styles.pagination}>

      <button disabled={page===1} onClick={()=>setPage(page-1)}>
        Anterior
      </button>

      <span>Página {page}</span>

      <button disabled={police.length < limit} onClick={()=>setPage(page+1)}>
        Próxima
      </button>

    </div>

   </div>

   <CreatePoliceModal
     isOpen={open}
     onClose={()=>setOpen(false)}
     onCreated={loadPolice}
   />

  </div>

 )

}

const styles:any = {
 header:{ display:"flex", justifyContent:"space-between", marginBottom:20 },
 primaryBtn:{ padding:10, background:"#6366f1", color:"#fff", border:"none", borderRadius:8 },
 card:{ background:"#fff", padding:20, borderRadius:10 },
 table:{ width:"100%" },
 pagination:{ marginTop:20, display:"flex", gap:10 }
}