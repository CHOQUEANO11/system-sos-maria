/* eslint-disable react-refresh/only-export-components */
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Shield,
  Siren,
  FileText
} from "lucide-react"
import { useAuth } from "../context/AuthContext"


type SidebarProps = {
  open: boolean
  mobile: boolean
  toggle: () => void
}

export const Roles = {
  SUPER_ADMIN : "SUPER_ADMIN",
  ADMIN : "ADMIN",
  WOMAN : "WOMAN"
}
export type Roles = (typeof Roles)[keyof typeof Roles]

export default function Sidebar({ open, mobile, toggle }: SidebarProps) {
  const user = useAuth()

  const handleClick = () => {

    if(mobile){
      toggle()
    }

  }

  if(mobile){

    return(

      <aside
        style={{
          position:"fixed",
          top:0,
          left: open ? 0 : -240,
          width:240,
          height:"100vh",
          background:"#fff",
          borderRight:"1px solid #eee",
          transition:"left .3s",
          zIndex:100
        }}
      >

        <nav
          style={{
            padding:20,
            display:"flex",
            flexDirection:"column",
            gap:20
          }}
        >

          <Link to="/dashboard" onClick={handleClick} style={menuItem}>
    <LayoutDashboard size={18}/>
    Dashboard
  </Link>

  <Link to="/admins" onClick={handleClick} style={menuItem}>
    <Shield size={18}/>
    Admins
  </Link>

  <Link to="/women" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Mulheres
  </Link>

  <Link to="/visitRequest" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Solicitação de Visita
  </Link>


  <Link to="/emergencies" onClick={handleClick} style={menuItem}>
    <Siren size={18}/>
    Pedidos de Ajuda
  </Link>

  {user?.user?.role === Roles.SUPER_ADMIN && (
  <Link to="/municipalities" onClick={handleClick} style={menuItem}>
    <Siren size={18}/>
    Municípios
  </Link>
)}

  <Link to="/reports" onClick={handleClick} style={menuItem}>
    <FileText size={18}/>
    Relatórios
  </Link>

        </nav>

      </aside>

    )

  }

  return(

    <aside
      style={{
        width: open ? 180 : 20,
        background:"#fff",
        borderRight:"1px solid #eee",
        transition:"width .3s"
      }}
    >

      <nav
        style={{
          padding:20,
          display:"flex",
          flexDirection:"column",
          gap:20
        }}
      >

        <Link to="/dashboard" onClick={handleClick} style={menuItem}>
    <LayoutDashboard size={18}/>
    Dashboard
  </Link>

  <Link to="/admins" onClick={handleClick} style={menuItem}>
    <Shield size={18}/>
    Admins
  </Link>

  <Link to="/efetivo" onClick={handleClick} style={menuItem}>
  <Shield size={18}/>
  Efetivo
</Link>

<Link to="/agenda-create" onClick={handleClick} style={menuItem}>
  <Users size={18}/>
  Criar Agenda
</Link>

  <Link to="/women" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Mulheres
  </Link>

  <Link to="/visitRequest" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Solicitação de Visita
  </Link>


  <Link to="/emergencies" onClick={handleClick} style={menuItem}>
    <Siren size={18}/>
    Pedidos de Ajuda
  </Link>

  {user?.user?.role === Roles.SUPER_ADMIN && (
  <Link to="/municipalities" onClick={handleClick} style={menuItem}>
    <Siren size={18}/>
    Municípios
  </Link>
)}

{user?.user?.role === Roles.SUPER_ADMIN && (
  <Link to="/units" onClick={handleClick} style={menuItem}>
    <Siren size={18}/>
    Unidades
  </Link>
)}

  <Link to="/reports" onClick={handleClick} style={menuItem}>
    <FileText size={18}/>
    Relatórios
  </Link>

      </nav>

    </aside>

  )

}
const menuItem = {

  display:"flex",
  alignItems:"center",
  gap:12,
  padding:"10px 12px",
  borderRadius:8,
  textDecoration:"none",
  color:"#374151",
  fontWeight:500,
  transition:"0.2s"

}