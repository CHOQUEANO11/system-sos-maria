/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"
import CreateWomanModal from "../components/modals/CreateWomanModal"
import EditWomanModal from "../components/modals/EditWomanModal"
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal"

type Woman = {
  id: string
  name: string
  cpf: string
  municipalityId?: string
  municipality?: {
    name: string
  }
  status?: string
}

export default function Women() {

  const { user } = useAuth()

  const [women, setWomen] = useState<Woman[]>([])
  const [loading, setLoading] = useState(false)
  const [open,setOpen] = useState(false)
  const [editOpen,setEditOpen] = useState(false)
const [deleteOpen,setDeleteOpen] = useState(false)

const [selectedWoman,setSelectedWoman] = useState<any>(null)


  const [page, setPage] = useState(1)
  const limit = 10

  const loadWomen = async () => {

    try {

      setLoading(true)

      const params: any = {
        role: "WOMAN",
        page,
        limit
      }

      // se não for CIEPAS filtra por município
      if (user?.role !== "SUPER_ADMIN") {
  params.municipalityId = user?.municipalityId
}

      const response = await api.get("/users",{ params })

      setWomen(response.data.data)

    } catch (error) {

      console.log("Erro ao carregar mulheres", error)

    } finally {
      setLoading(false)
    }

  }

  useEffect(()=>{
    loadWomen()
  },[page])

  const handleEdit = (woman:any) => {

 setSelectedWoman(woman)
 setEditOpen(true)

}

const handleDelete = (woman:any) => {

 setSelectedWoman(woman)
 setDeleteOpen(true)

}

const confirmDelete = async () => {

 await api.delete(`/users/${selectedWoman.id}`)

 setDeleteOpen(false)
 loadWomen()

}

  return(
    <>

    <div>

      <div style={styles.header}>

        <h2 style={styles.title}>
          Mulheres Cadastradas
        </h2>

        <button style={styles.primaryBtn} onClick={()=>setOpen(true)}>
 Nova Mulher
</button>

<CreateWomanModal
 isOpen={open}
 onClose={()=>setOpen(false)}
 onCreated={loadWomen}
/>

      </div>

      <div style={styles.card}>

        <table style={styles.table}>

          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>CPF</th>
              <th style={styles.th}>Município</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan={4} style={styles.empty}>
                  Carregando...
                </td>
              </tr>
            )}

            {!loading && women.length === 0 && (
              <tr>
                <td colSpan={4} style={styles.empty}>
                  Nenhuma mulher cadastrada
                </td>
              </tr>
            )}

            {women.map((woman,index)=>{

              const isInactive = woman.status === "Inativa"

              return(

                <tr
                  key={woman.id}
                  style={{
                    ...styles.row,
                    background:index % 2 === 0 ? "#fafafa" : "#fff"
                  }}
                >

                  <td style={styles.td}>{woman.name}</td>

                  <td style={styles.td}>{woman.cpf}</td>

                  <td style={styles.td}>
                    {woman.municipality?.name || "-"}
                  </td>

                  <td style={styles.td}>

                    <span
                      style={{
                        ...styles.statusBadge,
                        background:isInactive ? "#fee2e2" : "#dcfce7",
                        color:isInactive ? "#b91c1c" : "#166534"
                      }}
                    >
                      {woman.status || "Ativa"}
                    </span>

                  </td>

                  <td style={styles.td}>

 <div style={styles.actions}>

  <button
   style={styles.editBtn}
   onClick={()=>handleEdit(woman)}
  >
   Editar
  </button>

  <button
   style={styles.deleteBtn}
   onClick={()=>handleDelete(woman)}
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
            disabled={women.length < limit}
            onClick={()=>setPage(page + 1)}
            style={styles.pageBtn}
          >
            Próxima
          </button>

        </div>

      </div>

    </div>

    <EditWomanModal
 isOpen={editOpen}
 onClose={()=>setEditOpen(false)}
 onUpdated={loadWomen}
 woman={selectedWoman}
/>

<ConfirmDeleteModal
 isOpen={deleteOpen}
 onClose={()=>setDeleteOpen(false)}
 onConfirm={confirmDelete}
 name={selectedWoman?.name}
/>
</>

  )

}


const styles = {

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

  statusBadge:{
    padding:"5px 10px",
    borderRadius:6,
    fontSize:12,
    fontWeight:600
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
  },
  actions:{
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  gap:10
},

editBtn:{
  display:"flex",
  alignItems:"center",
  gap:6,
  padding:"6px 12px",
  borderRadius:6,
  border:"none",
  background:"#6366f1",
  color:"#fff",
  cursor:"pointer",
  fontSize:12,
  fontWeight:500
},

deleteBtn:{
  display:"flex",
  alignItems:"center",
  gap:6,
  padding:"6px 12px",
  borderRadius:6,
  border:"none",
  background:"#ef4444",
  color:"#fff",
  cursor:"pointer",
  fontSize:12,
  fontWeight:500
}

}