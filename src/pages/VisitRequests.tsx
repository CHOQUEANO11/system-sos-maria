/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function VisitRequests(){

 const { user } = useAuth()

 const [requests,setRequests] = useState([])
 const [loading,setLoading] = useState(false)

 const loadRequests = async () => {

  try{

   setLoading(true)

   const params:any = {
    role:user?.role,
    municipalityId:user?.municipalityId
   }

   const res = await api.get("/visit-requests",{params})

   setRequests(res.data)

  }catch(error){

   console.log("Erro ao carregar solicitações",error)

  }finally{

   setLoading(false)

  }

 }

 useEffect(()=>{
  loadRequests()
 },[])

 return(

  <div>

   <h2 style={styles.title}>
    Solicitações de Visita
   </h2>

   <div style={styles.card}>

    <table style={styles.table}>

     <thead>

      <tr>
       <th>Mulher</th>
       <th>Município</th>
       <th>Motivo</th>
       <th>Status</th>
       <th>Data</th>
      </tr>

     </thead>

     <tbody>

      {loading && (
       <tr>
        <td colSpan={5}>
         Carregando...
        </td>
       </tr>
      )}

      {!loading && requests.length === 0 && (
       <tr>
        <td colSpan={5}>
         Nenhuma solicitação
        </td>
       </tr>
      )}

      {requests.map((r:any)=>(
       
       <tr key={r.id}>

        <td align="center">{r.user?.name}</td>

        <td align="center">{r.municipality?.name}</td>

        <td align="center">{r.motivo}</td>

        <td align="center">

         <span style={{
          ...styles.status,
          background:r.status === "PENDENTE"
           ? "#fef3c7"
           : "#dcfce7"
         }}>

          {r.status}

         </span>

        </td>

        <td align="center">
         {new Date(r.createdAt).toLocaleDateString("pt-BR")}
        </td>

       </tr>

      ))}

     </tbody>

    </table>

   </div>

  </div>

 )

}

const styles:any = {

 title:{
  marginBottom:20
 },

 card:{
  background:"#fff",
  padding:25,
  borderRadius:12,
  boxShadow:"0 6px 18px rgba(0,0,0,0.06)"
 },

 table:{
  width:"100%",
  borderCollapse:"collapse"
 },

 status:{
  padding:"5px 10px",
  borderRadius:6,
  fontSize:12,
  fontWeight:600
 }

}