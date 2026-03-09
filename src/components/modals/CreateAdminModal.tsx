/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function CreateAdminModal({isOpen,onClose,onCreated}:any){

 const [municipalities,setMunicipalities] = useState([])
 const [form,setForm] = useState<any>({
  name:"",
  cpf:"",
  password:"",
  municipalityId:""
 })

 const loadMunicipalities = async () => {

  const res = await api.get("/municipalities")

  setMunicipalities(res.data.data)

 }

 useEffect(()=>{
  loadMunicipalities()
 },[])

 const handleCreate = async () => {

  await api.post("/users",{
   ...form,
   role:"ADMIN"
  })

  onCreated()
  onClose()

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
    onChange={(e)=>setForm({...form,name:e.target.value})}
   />

   <input
    placeholder="CPF"
    style={styles.input}
    onChange={(e)=>setForm({...form,cpf:e.target.value})}
   />

   <input
    placeholder="Senha"
    type="password"
    style={styles.input}
    onChange={(e)=>setForm({...form,password:e.target.value})}
   />

   <select
    style={styles.input}
    onChange={(e)=>setForm({...form,municipalityId:e.target.value})}
   >

    <option>Selecione município</option>

    {municipalities.map((m:any)=>(
      <option key={m.id} value={m.id}>
        {m.name}
      </option>
    ))}

   </select>

   <button onClick={handleCreate} style={styles.btn}>
    Salvar
   </button>

  </ModalBase>

 )

}

const styles:any = {

 input:{
  width:"100%",
  padding:10,
  borderRadius:6,
  border:"1px solid #ddd",
  marginBottom:12
 },

 btn:{
  width:"100%",
  padding:10,
  background:"#ec4899",
  color:"#fff",
  border:"none",
  borderRadius:6
 }

}