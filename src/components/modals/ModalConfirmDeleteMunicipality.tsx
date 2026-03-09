/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function DeleteMunicipalityModal({
  isOpen,
  onClose,
  municipality,
  onDeleted
}: any){

  const handleDelete = async () => {

    if(!municipality) return

    try{

      await api.delete(`/municipalities/${municipality.id}`)

      onDeleted()

      onClose()

    }catch(error){

      console.log("Erro ao excluir município",error)

      alert("Erro ao excluir município")

    }

  }

  return(

    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Município"
    >

      <p style={styles.text}>
        Deseja realmente excluir o município
        <strong> {municipality?.name}</strong> ?
      </p>

      <div style={styles.actions}>

        <button
          style={styles.cancel}
          onClick={onClose}
        >
          Cancelar
        </button>

        <button
          style={styles.delete}
          onClick={handleDelete}
        >
          Excluir
        </button>

      </div>

    </ModalBase>

  )

}

const styles:any = {

  text:{
    marginBottom:20,
    fontSize:14
  },

  actions:{
    display:"flex",
    justifyContent:"flex-end",
    gap:10
  },

  cancel:{
    padding:"8px 14px",
    border:"1px solid #ddd",
    background:"#fff",
    borderRadius:6,
    cursor:"pointer"
  },

  delete:{
    padding:"8px 14px",
    border:"none",
    background:"#ef4444",
    color:"#fff",
    borderRadius:6,
    cursor:"pointer"
  }

}