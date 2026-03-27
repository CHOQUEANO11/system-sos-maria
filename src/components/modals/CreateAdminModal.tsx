 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function CreateAdminModal({isOpen,onClose,onCreated}:any){

 const [municipalities,setMunicipalities] = useState([])
 const [unidades,setUnidades] = useState([])

 const [loading,setLoading] = useState(false)

 const [form,setForm] = useState<any>({
  name:"",
  cpf:"",
  email: "",
  phone: "",
  password:"",
  address: "",
  municipalityId:"",
  unidadeId:""
 })

 /* =========================
    LOAD MUNICÍPIOS
 ========================= */
 const loadMunicipalities = async () => {
  const res = await api.get("/municipalities")
  setMunicipalities(res.data.data || res.data)
 }

 /* =========================
    LOAD UNIDADES
 ========================= */
 const loadUnidades = async (municipalityId:string) => {
  const res = await api.get("/unidades",{
    params:{ municipalityId }
  })
  setUnidades(res.data)
 }

 useEffect(()=>{
  if(isOpen){
    loadMunicipalities()
  }
 },[isOpen])

 /* =========================
    RESET AO FECHAR
 ========================= */
 useEffect(()=>{
  if(!isOpen){
    setForm({
      name:"",
      cpf:"",
      email: "",
      phone: "",
      password:"",
      address: "",
      municipalityId:"",
      unidadeId:""
    })
    setUnidades([])
  }
 },[isOpen])

 const handleMunicipalityChange = (id:string)=>{
  setForm({
    ...form,
    municipalityId:id,
    unidadeId:""
  })
  loadUnidades(id)
 }

 /* =========================
    CREATE
 ========================= */
 const handleCreate = async () => {

  if(!form.name || !form.cpf || !form.password){
    alert("Preencha todos os campos obrigatórios")
    return
  }

  if(!form.municipalityId){
    alert("Selecione o município")
    return
  }

  if(!form.unidadeId){
    alert("Selecione a unidade")
    return
  }

  try{

    setLoading(true)

    await api.post("/users",{
      ...form,
      role:"ADMIN"
    })

    onCreated()
    onClose()

  }catch{
    alert("Erro ao cadastrar admin")
  }finally{
    setLoading(false)
  }

 }

 return(

  <ModalBase
   isOpen={isOpen}
   onClose={onClose}
   title="Cadastrar Admin"
  >

   <input
    placeholder="Nome"
    style={styles.input}
    value={form.name}
    onChange={(e)=>setForm({...form,name:e.target.value})}
   />

   <input
    placeholder="CPF"
    style={styles.input}
    value={form.cpf}
    onChange={(e)=>setForm({...form,cpf:e.target.value})}
   />

   <input
    placeholder="Email"
    style={styles.input}
    value={form.email}
    onChange={(e)=>setForm({...form,email:e.target.value})}
   />

   <input
    placeholder="Telefone"
    style={styles.input}
    value={form.phone}
    onChange={(e)=>setForm({...form,phone:e.target.value})}
   />


   <input
    placeholder="Endereço"
    style={styles.input}
    value={form.address}
    onChange={(e)=>setForm({...form,address:e.target.value})}
   />

   <input
    placeholder="Senha"
    type="password"
    style={styles.input}
    value={form.password}
    onChange={(e)=>setForm({...form,password:e.target.value})}
   />

   {/* MUNICÍPIO */}
   <select
    style={styles.input}
    value={form.municipalityId}
    onChange={(e)=>handleMunicipalityChange(e.target.value)}
   >
    <option value="">Selecione o município</option>

    {municipalities.map((m:any)=>(
      <option key={m.id} value={m.id}>
        {m.name}
      </option>
    ))}
   </select>

   {/* UNIDADE */}
   <select
    style={styles.input}
    value={form.unidadeId}
    onChange={(e)=>setForm({...form,unidadeId:e.target.value})}
    disabled={!form.municipalityId}
   >
    <option value="">Selecione a Unidade</option>

    {unidades.map((u:any)=>(
      <option key={u.id} value={u.id}>
        {u.name}
      </option>
    ))}
   </select>

   <button
    onClick={handleCreate}
    style={{
      ...styles.btn,
      opacity: loading ? 0.7 : 1
    }}
    disabled={loading}
   >
    {loading ? "Salvando..." : "Salvar"}
   </button>

  </ModalBase>

 )

}

const styles:any = {

 input:{
  width:"100%",
  padding:12,
  borderRadius:8,
  border:"1px solid #e5e7eb",
  marginBottom:12,
  outline:"none"
 },

 btn:{
  width:"100%",
  padding:12,
  background:"#ec4899",
  color:"#fff",
  border:"none",
  borderRadius:8,
  fontWeight:"bold",
  cursor:"pointer",
  transition:"0.2s"
 }

}