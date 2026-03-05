import { useState, useEffect } from "react"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

export default function DashboardLayout({ children }) {

  const [open,setOpen] = useState(true)
  const [mobile,setMobile] = useState(false)

  useEffect(()=>{

    const check = () => {

      if(window.innerWidth < 768){
        setMobile(true)
        setOpen(false)
      } else {
        setMobile(false)
        setOpen(true)
      }

    }

    check()

    window.addEventListener("resize",check)

    return ()=>window.removeEventListener("resize",check)

  },[])

  const toggle = () => setOpen(!open)

  return (

    <div
      style={{
        display:"flex",
        flexDirection:"column",
        minHeight:"100vh"
      }}
    >

      <Header toggle={toggle}/>

      <div
        style={{
          display:"flex",
          flex:1
        }}
      >

        <Sidebar
  open={open}
  mobile={mobile}
  toggle={toggle}
/>

        <main
          style={{
            flex:1,
            padding:20,
            background:"#f6f7fb",
            overflowY:"auto"
          }}
        >
          {children}
        </main>

      </div>

    </div>

  )

}