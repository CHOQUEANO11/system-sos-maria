/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

type Emergency = {
  user: any
  id: string
  woman?: {
    name: string
    municipality?: {
      name: string
    }
  }
  createdAt: string
  status: string
}

export default function Emergencies(){

  const { user } = useAuth()

  const [emergencies,setEmergencies] = useState<Emergency[]>([])
  const [loading,setLoading] = useState(false)

  const [page,setPage] = useState(1)
  const limit = 10

  const loadEmergencies = async () => {

  try{

    setLoading(true)

    const params:any = {
      page,
      limit
    }

    // regra de acesso
    if(user?.name !== "CIEPAS"){
      params.municipalityId = user?.municipalityId
    }

    const token = localStorage.getItem("token")

    const response = await api.get("/emergencies",{
      params,
      headers:{
        Authorization:`Bearer ${token}`
      }
    })

    setEmergencies(response.data.data)

  }catch(error){

    console.log("Erro ao carregar emergências",error)

  }finally{
    setLoading(false)
  }

}

  useEffect(()=>{
    loadEmergencies()
  },[page])

  return(

    <div>

      <h2 style={styles.title}>
        Pedidos de Ajuda
      </h2>

      <div style={styles.card}>
        <div style={{width: '100%', overflowX:"auto"}}>
        <table style={styles.table}>

          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Município</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Situação</th>
              <th style={styles.th}>Açao</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan={5} style={styles.empty}>
                  Carregando...
                </td>
              </tr>
            )}

            {!loading && emergencies.length === 0 && (
              <tr>
                <td colSpan={5} style={styles.empty}>
                  Nenhum pedido encontrado
                </td>
              </tr>
            )}

            {emergencies.map((item,index)=>{
              console.log("Emergência", item) // Log para verificar os dados da emergência

              const date = new Date(item.createdAt)

              return(

                <tr
                  key={item.id}
                  style={{
                    ...styles.row,
                    background:index % 2 === 0 ? "#fafafa" : "#fff"
                  }}
                >

                  <td style={styles.td}>
                    {item?.user?.name}
                  </td>

                  <td style={styles.td}>
                    {item.user?.municipality?.name || "-"}
                  </td>

                  <td style={styles.td}>
                    {date.toLocaleDateString()}
                  </td>

                  <td style={styles.td}>

                    <span style={styles.emergencyBadge}>
                      Emergência
                    </span>

                  </td>

                  <td style={styles.td}>

                    {item.status === "PENDING" ? "Pendente" :
                     item.status === "IN_PROGRESS" ? "Em Progresso" :
                     item.status === "RESOLVED" ? "Resolvida" : item.status}

                  </td>

                  <td style={styles.td}>

                    <Link
                      to={`/emergency/${item.id}`}
                      style={styles.detailsBtn}
                    >
                      detalhes
                    </Link>

                  </td>

                </tr>

              )

            })}

          </tbody>

        </table>
        </div>

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
            disabled={emergencies.length < limit}
            onClick={()=>setPage(page + 1)}
            style={styles.pageBtn}
          >
            Próxima
          </button>

        </div>

      </div>

    </div>

  )

}

const styles = {

  title:{
    marginBottom:20,
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
    borderCollapse:"collapse" as const
  },

  thead:{
    background:"#f9fafb"
  },

  th:{
    textAlign:"left" as const,
    padding:"14px 16px",
    fontSize:13,
    color:"#6b7280",
    borderBottom:"1px solid #e5e7eb",
    fontWeight:600
  },
  tableWrapper:{
  width:"100%",
  overflowX:"auto"
},

  td:{
    padding:"14px 16px",
    fontSize:14,
    borderBottom:"1px solid #f1f5f9"
  },

  row:{
    transition:"background 0.2s"
  },

  empty:{
    padding:25,
    textAlign:"center" as const,
    color:"#9ca3af"
  },

  emergencyBadge:{
    padding:"5px 10px",
    borderRadius:6,
    background:"#fee2e2",
    color:"#b91c1c",
    fontSize:12,
    fontWeight:600
  },

  detailsBtn:{
    padding:"6px 12px",
    background:"#6366f1",
    color:"#fff",
    borderRadius:6,
    textDecoration:"none",
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