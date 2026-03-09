/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function CreateMunicipalityModal({isOpen,onClose,onCreated}:any){

 const [name,setName] = useState("")

 const handleCreate = async () => {

  await api.post("/municipalities",{ name })

  onCreated()
  onClose()

 }

 return(

  <ModalBase
   isOpen={isOpen}
   onClose={onClose}
   title="Cadastrar Município"
  >

   <input
    placeholder="Nome do município"
    value={name}
    onChange={(e)=>setName(e.target.value)}
    style={styles.input}
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
  marginBottom:15
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