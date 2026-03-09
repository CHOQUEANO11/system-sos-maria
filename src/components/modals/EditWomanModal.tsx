/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function EditWomanModal({isOpen,onClose,onUpdated,woman}:any){

 const [form,setForm] = useState<any>({
  name:"",
  cpf:"",
  email:"",
  phone:"",
  address:""
 })

 useEffect(()=>{

  if(woman){

   setForm({
    name:woman.name || "",
    cpf:woman.cpf || "",
    email:woman.email || "",
    phone:woman.phone || "",
    address:woman.address || ""
   })

  }

 },[woman])

 const handleUpdate = async () => {

  await api.put(`/users/${woman.id}`,form)

  onUpdated()
  onClose()

 }

 if(!woman) return null

 return(

  <ModalBase
   isOpen={isOpen}
   onClose={onClose}
   title="Editar Mulher"
  >

   <input
    value={form.name}
    placeholder="Nome"
    style={styles.input}
    onChange={(e)=>setForm({...form,name:e.target.value})}
   />

   <input
    value={form.cpf}
    placeholder="CPF"
    style={styles.input}
    onChange={(e)=>setForm({...form,cpf:e.target.value})}
   />

   <input
    value={form.phone}
    placeholder="Telefone"
    style={styles.input}
    onChange={(e)=>setForm({...form,phone:e.target.value})}
   />

   <input
    value={form.email}
    placeholder="Email"
    style={styles.input}
    onChange={(e)=>setForm({...form,email:e.target.value})}
   />

   <input
    value={form.address}
    placeholder="Endereço"
    style={styles.input}
    onChange={(e)=>setForm({...form,address:e.target.value})}
   />

   <button
    onClick={handleUpdate}
    style={styles.btn}
   >
    Atualizar
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
  background:"#6366f1",
  color:"#fff",
  border:"none",
  borderRadius:6
 }

}