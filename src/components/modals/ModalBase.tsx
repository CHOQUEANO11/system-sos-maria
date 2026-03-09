/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react"
type Props = {
 isOpen:boolean
 onClose:()=>void
 title:string
 children:ReactNode
}

export default function ModalBase({isOpen,onClose,title,children}:Props){

 if(!isOpen) return null

 return(

  <div style={styles.overlay}>

   <div style={styles.modal}>

    <div style={styles.header}>

      <h3>{title}</h3>

      <button onClick={onClose} style={styles.close}>
        ✕
      </button>

    </div>

    <div>
      {children}
    </div>

   </div>

  </div>

 )

}

const styles:any = {

 overlay:{
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,0.4)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  zIndex:999
 },

 modal:{
  width:420,
  background:"#fff",
  padding:25,
  borderRadius:12
 },

 header:{
  display:"flex",
  justifyContent:"space-between",
  marginBottom:20
 },

 close:{
  border:"none",
  background:"transparent",
  cursor:"pointer",
  fontSize:18
 }

}