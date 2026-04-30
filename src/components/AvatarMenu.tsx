/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react"
import { User, LogOut } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function AvatarMenu() {

  const [open,setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  const user = useAuth()
  console.log("USER",user)

  const logout = () => {

    localStorage.removeItem("token")

    navigate("/")

  }

  useEffect(()=>{

    const handleClickOutside = (event:any)=>{

      if(ref.current && !ref.current.contains(event.target)){
        setOpen(false)
      }

    }

    document.addEventListener("click",handleClickOutside)

    return ()=>document.removeEventListener("click",handleClickOutside)

  },[])

  return(

    <div ref={ref} style={{position:"relative"}}>

      <img
        src="https://i.pravatar.cc/40"
        style={{
          borderRadius:"50%",
          cursor:"pointer"
        }}
        onClick={()=>setOpen(!open)}
      />

      {open && (

        <div style={{
          position:"absolute",
          right:0,
          top:50,
          width:200,
          background:"#fff",
          borderRadius:10,
          boxShadow:"0 5px 20px rgba(0,0,0,0.2)",
          padding:10
        }}>

          <div style={{
            borderBottom:"1px solid #eee",
            paddingBottom:10,
            marginBottom:10
          }}>

            <strong>{user.user?.name}</strong>
            <p style={{fontSize:12,color:"#666"}}>{user.user?.role}</p>

          </div>

          <Link
  to="/profile"
  style={{
    display: "flex",
    gap: 10,
    width: "100%",
    border: "none",
    background: "transparent",
    padding: 10,
    cursor: "pointer",
    textDecoration: "none",
    color: "#374151"
  }}
>
  <User size={16} />
  Perfil
</Link>


          <button
            onClick={logout}
            style={{
              display:"flex",
              gap:10,
              width:"100%",
              border:"none",
              background:"transparent",
              padding:10,
              cursor:"pointer",
              color:"#ef4444"
            }}
          >
            <LogOut size={16}/>
            Sair
          </button>

        </div>

      )}

    </div>

  )

}