/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { Plus, Pencil } from "lucide-react"
import { api } from "../services/api"
import CreateMunicipalityModal from "../components/modals/CreateMunicipalityModal"
import DeleteMunicipalityModal from "../components/modals/ModalConfirmDeleteMunicipality"

type Municipality = {
 id: string
 name: string
 createdAt: string
}

export default function Municipalities(){

 const [municipalities,setMunicipalities] = useState<Municipality[]>([])
 const [deleteOpen,setDeleteOpen] = useState(false)
const [selectedMunicipality,setSelectedMunicipality] = useState<any>(null)
 const [loading,setLoading] = useState(false)
 const [openCreate,setOpenCreate] = useState(false)

 const [page,setPage] = useState(1)
 const limit = 10

 const loadMunicipalities = async () => {

  try{

    setLoading(true)

    const response = await api.get("/municipalities",{
      params:{ page, limit }
    })

    setMunicipalities(response.data || [])

    console.log("Municipalities loaded:",response.data)

  }catch(error){

    console.log("Erro ao carregar municípios",error)

  }finally{
    setLoading(false)
  }

 }

//  const deleteMunicipality = async (id:string) => {

//   const confirmDelete = window.confirm("Deseja excluir este município?")

//   if(!confirmDelete) return

//   try{

//     await api.delete(`/municipalities/${id}`)

//     loadMunicipalities()

//   }catch(error){

//     console.log("Erro ao excluir município",error)

//   }

//  }

 useEffect(()=>{
  loadMunicipalities()
 },[page])

 return(
  <>

  <div>

   <div style={styles.header}>

    <h2 style={styles.title}>
     Municípios cadastrados
    </h2>

    <button
  style={styles.primaryBtn}
  onClick={()=>setOpenCreate(true)}
>
  <Plus size={18}/>
  Novo Município
</button>

   </div>

   <div style={styles.card}>
<div style={styles.tableWrapper}>
    <table style={styles.table}>

     <thead style={styles.thead}>

      <tr style={styles.row}>
       <th style={styles.th}>Nome</th>
       <th style={styles.th}>Data cadastro</th>
       <th style={styles.th}>Ações</th>
      </tr>

     </thead>

     <tbody>

      {loading && (

       <tr>
        <td colSpan={3} style={styles.empty}>
         Carregando...
        </td>
       </tr>

      )}

      {!loading && municipalities.length === 0 && (

       <tr>
        <td colSpan={3} style={styles.empty}>
         Nenhum município encontrado
        </td>
       </tr>

      )}

      {municipalities.map((m,index)=>{

       const date = new Date(m.createdAt)

       return(

        <tr
         key={m.id}
         style={{
          ...styles.row,
          background:index % 2 === 0 ? "#fafafa" : "#fff"
         }}
        >

         <td style={styles.td}>
          {m.name}
         </td>

         <td style={styles.td}>
          {date.toLocaleDateString()}
         </td>

         <td style={styles.td}>

          <div style={styles.actions}>

           <button style={styles.editBtn}>
            <Pencil size={16}/>
            Editar
           </button>

           <button
  style={styles.deleteBtn}
  onClick={()=>{
    setSelectedMunicipality(m)
    setDeleteOpen(true)
  }}
>
  Excluir
</button>

          </div>

         </td>

        </tr>

       )

      })}

     </tbody>

    </table>
    </div>

    {/* PAGINAÇÃO */}

    <div style={styles.pagination}>

     <button
      disabled={page === 1}
      onClick={()=>setPage(page - 1)}
      style={styles.pageBtn}
     >
      Anterior
     </button>

     <span style={styles.pageText}>
      Página {page}
     </span>

     <button
      disabled={municipalities.length < limit}
      onClick={()=>setPage(page + 1)}
      style={styles.pageBtn}
     >
      Próxima
     </button>

    </div>

   </div>

  </div>
 <CreateMunicipalityModal
  isOpen={openCreate}
  onClose={()=>setOpenCreate(false)}
  onCreated={loadMunicipalities}
/>

<DeleteMunicipalityModal
  isOpen={deleteOpen}
  onClose={()=>setDeleteOpen(false)}
  municipality={selectedMunicipality}
  onDeleted={loadMunicipalities}
/>
</>

 )


}

const styles:any = {

 header:{
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:20
 },

 title:{
  margin:0,
  fontSize:22
 },


 card:{
  background:"#fff",
  padding:25,
  borderRadius:14,
  boxShadow:"0 6px 18px rgba(0,0,0,0.06)"
 },

 table:{
  width:"100%",
  borderCollapse:"collapse"
 },

 thead:{
  background:"#f9fafb"
 },

 th:{
  textAlign:"center",
  padding:"14px 16px",
  fontSize:13,
  color:"#6b7280",
  borderBottom:"1px solid #e5e7eb",
  fontWeight:600
},

 td:{
  textAlign:"center",
  padding:"14px 16px",
  fontSize:14,
  borderBottom:"1px solid #f1f5f9"
  
},
tableWrapper:{
  width:"100%",
  overflowX:"auto"
},

 row:{
  transition:"background 0.2s",
  cursor:"pointer",

 },

 empty:{
  padding:25,
  textAlign:"center",
  color:"#9ca3af"
 },

 actions:{
  display:"flex",
  gap:10,
  justifyContent:"center",
  alignItems:"center",
  width:"100%"
},

 primaryBtn:{
  display:"flex",
  gap:8,
  alignItems:"center",
  padding:"10px 16px",
  background:"#ec4899",
  color:"#fff",
  border:"none",
  borderRadius:8,
  cursor:"pointer",
  fontWeight:500
 },

 editBtn:{
  display:"flex",
  gap:6,
  alignItems:"center",
  padding:"6px 12px",
  borderRadius:6,
  background:"#6366f1",
  color:"#fff",
  border:"none",
  cursor:"pointer",
  fontSize:12
 },

 deleteBtn:{
  display:"flex",
  gap:6,
  alignItems:"center",
  padding:"6px 12px",
  borderRadius:6,
  background:"#ef4444",
  color:"#fff",
  border:"none",
  cursor:"pointer",
  fontSize:12
 },

 pagination:{
  marginTop:25,
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  gap:15
 },

 pageBtn:{
  padding:"8px 14px",
  borderRadius:6,
  border:"1px solid #e5e7eb",
  background:"#fff",
  cursor:"pointer"
 },

 pageText:{
  fontWeight:500
 }

}