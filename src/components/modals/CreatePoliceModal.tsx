/* eslint-disable react-hooks/exhaustive-deps */
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

export default function CreatePoliceModal({ isOpen, onClose, onCreated }: any){

 const { user } = useAuth()

 const [unidades,setUnidades] = useState([])
 const [graduacoes,setGraduacoes] = useState([])

 const [form,setForm] = useState<any>({
  name:"",
  cpf:"",
  email:"",
  password:"",
  phone:"",
  address:"",
  unidadeId:"",
  graduacaoId:""
 })

 const loadData = async () => {

  const params:any = {}

  if(user?.role !== "SUPER_ADMIN"){
    params.municipalityId = user?.municipalityId
  }

  const [u,g] = await Promise.all([
    api.get("/unidades",{ params }),
    api.get("/graduacoes")
  ])

  setUnidades(u.data)
  setGraduacoes(g.data)

 }

 useEffect(()=>{
  if(isOpen){
    loadData()
  }
 },[isOpen])

 const handleCreate = async () => {

  await api.post("/police",{
    ...form,
    municipalityId: user?.municipalityId
  })

  onCreated()
  onClose()

 }

 return(

  <ModalBase
   isOpen={isOpen}
   onClose={onClose}
   title="Cadastrar Policial"
  >

   <input placeholder="Nome" style={styles.input}
    onChange={(e)=>setForm({...form,name:e.target.value})}
   />

   <input placeholder="CPF" style={styles.input}
    onChange={(e)=>setForm({...form,cpf:e.target.value})}
   />

   <input placeholder="Email" style={styles.input}
    onChange={(e)=>setForm({...form,email:e.target.value})}
   />

   <input placeholder="Senha" type="password" style={styles.input}
    onChange={(e)=>setForm({...form,password:e.target.value})}
   />

   <input placeholder="Telefone" style={styles.input}
    onChange={(e)=>setForm({...form,phone:e.target.value})}
   />

   <input placeholder="Endereço" style={styles.input}
    onChange={(e)=>setForm({...form,address:e.target.value})}
   />

   <select style={styles.input}
    onChange={(e)=>setForm({...form,unidadeId:e.target.value})}
   >
    <option>Selecione a Unidade</option>
    {unidades.map((u:any)=>(
      <option key={u.id} value={u.id}>{u.name}</option>
    ))}
   </select>

   <select style={styles.input}
    onChange={(e)=>setForm({...form,graduacaoId:e.target.value})}
   >
    <option>Selecione a Graduação</option>
    {graduacoes.map((g:any)=>(
      <option key={g.id} value={g.id}>{g.name}</option>
    ))}
   </select>

   <button onClick={handleCreate} style={styles.btn}>
    Salvar
   </button>

  </ModalBase>

 )

}

const styles:any = {
 input:{ width:"100%", padding:10, borderRadius:6, border:"1px solid #ddd", marginBottom:12 },
 btn:{ width:"100%", padding:10, background:"#6366f1", color:"#fff", border:"none", borderRadius:6 }
}