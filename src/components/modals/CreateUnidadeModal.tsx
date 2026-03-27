/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function CreateUnidadeModal({isOpen,onClose,onCreated}:any){

 const [municipalities,setMunicipalities] = useState([])

 const [form,setForm] = useState<any>({
  name:"",
  address:"",
  phone:"",
  municipalityId:""
 })

 const load = async ()=>{
  const res = await api.get("/municipalities")
  setMunicipalities(res.data.data || res.data)
 }

 useEffect(()=>{
  if(isOpen){
    load()
  }
 },[isOpen])

 const handleCreate = async ()=>{

  await api.post("/unidades",form)

  onCreated()
  onClose()

 }

 return(

  <ModalBase isOpen={isOpen} onClose={onClose} title="Cadastrar Unidade">

    <input placeholder="Nome" style={styles.input}
      onChange={(e)=>setForm({...form,name:e.target.value})}
    />

    <input placeholder="Endereço" style={styles.input}
      onChange={(e)=>setForm({...form,address:e.target.value})}
    />

    <input placeholder="Telefone" style={styles.input}
      onChange={(e)=>setForm({...form,phone:e.target.value})}
    />

    {/* 🔥 SELECT MUNICÍPIO */}
    <select
      style={styles.input}
      onChange={(e)=>setForm({...form,municipalityId:e.target.value})}
    >
      <option>Selecione o Município</option>

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
 input:{ width:"100%", padding:10, marginBottom:10 },
 btn:{ width:"100%", padding:10, background:"#10b981", color:"#fff" }
}