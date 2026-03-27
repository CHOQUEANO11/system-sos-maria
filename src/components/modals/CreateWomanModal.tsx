/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

export default function CreateWomanModal({isOpen,onClose,onCreated}:any){

 const {user} = useAuth()
 console.log("User in CreateWomanModal", user)

 const [form,setForm] = useState<any>({
  name:"",
  rg: "",
  cpf:"",
  email:"",
  phone:"",
  address:"",
  processNumber: ""
 })

 const handleCreate = async () => {

  if (!user) return

  try{

    await api.post("/users",{
      ...form,
      password: 'maria@2026',
      role:"WOMAN",
      municipalityId: user.municipalityId,
      unidadeId: user.unidadeId
    })

    onCreated()
    onClose()

  }catch{
    alert("Erro ao cadastrar")
  }

}

 return(

  <ModalBase
   isOpen={isOpen}
   onClose={onClose}
   title="Cadastrar Mulher"
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
    placeholder="Rg"
    style={styles.input}
    onChange={(e)=>setForm({...form,rg:e.target.value})}
   />

   <input
    placeholder="Telefone"
    style={styles.input}
    onChange={(e)=>setForm({...form,phone:e.target.value})}
   />

   <input
    placeholder="Email"
    style={styles.input}
    onChange={(e)=>setForm({...form,email:e.target.value})}
   />

   <input
    placeholder="Endereço"
    style={styles.input}
    onChange={(e)=>setForm({...form,address:e.target.value})}
   />

   <input
    placeholder="Número Processo"
    style={styles.input}
    onChange={(e)=>setForm({...form,processNumber:e.target.value})}
   />


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
  borderRadius:6,
  cursor:"pointer"
 }

}