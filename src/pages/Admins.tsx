/* eslint-disable @typescript-eslint/no-explicit-any */

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

type Admin = {
  id: string
  name: string
  email: string
  municipalityId?: string
  municipality?: {
    name: string
  }
}

export default function Admins(){

  const [admins,setAdmins] = useState<Admin[]>([])
  const [loading,setLoading] = useState(false)

  const [page,setPage] = useState(1)
  const limit = 10

  const {user} = useAuth()

  const [editOpen,setEditOpen] = useState(false)
  const [selectedAdmin,setSelectedAdmin] = useState<Admin | null>(null)

  const [form,setForm] = useState<any>({
    name:"",
    email:"",
    password:""
  })

  const loadAdmins = async () => {

    try{

      setLoading(true)

      const params:any = {
        role:"ADMIN",
        page,
        limit
      }

      if(user?.role !== "SUPER_ADMIN"){
        params.municipalityId = user?.municipalityId
      }

      const response = await api.get("/users",{ params })

      setAdmins(response.data.data || [])

    }catch(error){

      console.log("Erro ao carregar admins",error)

    }finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    loadAdmins()
  },[page])

  const openEdit = (admin:Admin)=>{

    setSelectedAdmin(admin)

    setForm({
      name:admin.name,
      email:admin.email,
      password:""
    })

    setEditOpen(true)

  }

  const updateAdmin = async () => {

    if(!selectedAdmin) return

    try{


       const payload:any = {
      name:form.name,
      email:form.email
    }


      if(form.password){
      payload.password = form.password
    }

      await api.put(`/users/${selectedAdmin.id}`,form)

      setEditOpen(false)

      loadAdmins()

    }catch(error){

      console.log("Erro ao atualizar admin",error)

    }

  }

  return(

    <div>

      <div style={styles.header}>

        <h2 style={styles.title}>
          Administradores
        </h2>

        <button style={styles.primaryBtn}>
          <Plus size={18}/>
          Novo Admin
        </button>

      </div>

      <div style={styles.card}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>

          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Município</th>
              <th style={styles.th}>Ações</th>
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

            {!loading && admins.length === 0 && (
              <tr>
                <td colSpan={4} style={styles.empty}>
                  Nenhum administrador encontrado
                </td>
              </tr>
            )}

            {admins.map((admin,index)=>(
              <tr
                key={admin.id}
                style={{
                  ...styles.row,
                  background:index % 2 === 0 ? "#fafafa" : "#fff"
                }}
              >

                <td style={styles.td}>
                  {admin.name}
                </td>

                <td style={styles.td}>
                  {admin.email}
                </td>

                <td style={styles.td}>
                  {admin.municipality?.name || "-"}
                </td>

                <td style={styles.td}>

                  <button
                    style={styles.editBtn}
                    onClick={()=>openEdit(admin)}
                  >
                    Editar
                  </button>

                </td>

              </tr>
            ))}

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
            disabled={admins.length < limit}
            onClick={()=>setPage(page + 1)}
            style={styles.pageBtn}
          >
            Próxima
          </button>

        </div>

      </div>

      {/* MODAL EDITAR ADMIN */}

      {editOpen && (

        <div style={modal.overlay}>

          <div style={modal.container}>

            <h3 style={{marginBottom:20}}>
              Editar Administrador
            </h3>

            <input
              style={modal.input}
              value={form.name}
              placeholder="Nome"
              onChange={(e)=>setForm({...form,name:e.target.value})}
            />

            <input
              style={modal.input}
              value={form.email}
              placeholder="Email"
              onChange={(e)=>setForm({...form,email:e.target.value})}
            />

            <input
  type="password"
  style={modal.input}
  placeholder="Nova senha (opcional)"
  value={form.password}
  onChange={(e)=>setForm({...form,password:e.target.value})}
/>

            <div style={modal.actions}>

              <button
                style={modal.cancel}
                onClick={()=>setEditOpen(false)}
              >
                Cancelar
              </button>

              <button
                style={modal.save}
                onClick={updateAdmin}
              >
                Salvar
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

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
    textAlign:"left",
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
  tableWrapper:{
  width:"100%",
  overflowX:"auto"
},

  empty:{
    padding:25,
    textAlign:"center",
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

  editBtn:{
    padding:"6px 12px",
    background:"#6366f1",
    color:"#fff",
    border:"none",
    borderRadius:6,
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

const modal:any = {

  overlay:{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.4)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:999
  },

  container:{
    background:"#fff",
    padding:30,
    borderRadius:12,
    width:400
  },

  input:{
    width:"100%",
    padding:10,
    border:"1px solid #ddd",
    borderRadius:6,
    marginBottom:12
  },

  actions:{
    display:"flex",
    justifyContent:"flex-end",
    gap:10,
    marginTop:10
  },

  cancel:{
    padding:"8px 14px",
    border:"1px solid #ddd",
    background:"#fff",
    borderRadius:6
  },

  save:{
    padding:"8px 14px",
    border:"none",
    background:"#ec4899",
    color:"#fff",
    borderRadius:6
  }

}