/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalBase from "./ModalBase"

export default function ConfirmDeleteModal({
 isOpen,
 onClose,
 onConfirm,
 name
}:any){

 return(

  <ModalBase
   isOpen={isOpen}
   onClose={onClose}
   title="Confirmar exclusão"
  >

   <p style={{marginBottom:20}}>
    Tem certeza que deseja excluir <strong>{name}</strong>?
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
     onClick={onConfirm}
    >
     Excluir
    </button>

   </div>

  </ModalBase>

 )

}

const styles:any = {

 actions:{
  display:"flex",
  justifyContent:"flex-end",
  gap:10
 },

 cancel:{
  padding:"8px 14px",
  border:"1px solid #ddd",
  background:"#fff",
  borderRadius:6
 },

 delete:{
  padding:"8px 14px",
  border:"none",
  background:"#ef4444",
  color:"#fff",
  borderRadius:6
 }

}