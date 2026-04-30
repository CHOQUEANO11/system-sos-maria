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
import IMG2 from "../../public/sos2.png"


type SidebarProps = {
  open: boolean
  mobile: boolean
  toggle: () => void
}

export const Roles = {
  SUPER_ADMIN : "SUPER_ADMIN",
  ADMIN : "ADMIN",
  WOMAN : "WOMAN",
  POLICE : "POLICE"
}
export type Roles = (typeof Roles)[keyof typeof Roles]

export default function Sidebar({ open, mobile, toggle }: SidebarProps) {
  const user = useAuth()
  console.log("Sidebar renderizado, user:", user)

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
          <img src={IMG2} alt="Logo SOS Maria" style={{ width: "100%", marginBottom: 20 }} />
          </Link>

          <Link to="/dashboard" onClick={handleClick} style={menuItem}>
    <LayoutDashboard size={18}/>
    Dashboard
  </Link>
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  &&  (
  <Link to="/admins" onClick={handleClick} style={menuItem}>
    <Shield size={18}/>
    Admins
  </Link>
  )}
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  && (
  <Link to="/efetivo" onClick={handleClick} style={menuItem}>
  <Shield size={18}/>
  Efetivo
</Link>
)}
{user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN     && (
  <Link to="/agenda-create" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Criar Agenda
  </Link>
)}

{/* {user?.user?.role === Roles.ADMIN && ( */}
  <Link to="/agenda-police" onClick={handleClick} style={menuItem}>
    <Shield size={18}/>
    Minhas Visitas
  </Link>
{/* )} */}
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  && (
  <Link to="/women" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Mulheres
  </Link>
)}
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  && (
  <Link to="/visitRequest" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Solicitação de Visita
  </Link>
  )}


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
{/* {user?.user?.role === Roles.SUPER_ADMIN && (
  <Link to="/graduations" onClick={handleClick} style={menuItem}>
    <Siren size={18}/>
    Graduações
  </Link>
)} */}
{user?.user?.role === Roles.SUPER_ADMIN && (
  <Link to="/reports" onClick={handleClick} style={menuItem}>
    <FileText size={18}/>
    Relatórios
  </Link>
)}

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
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  && (
  <Link to="/admins" onClick={handleClick} style={menuItem}>
    <Shield size={18}/>
    Admins
  </Link>
  )}
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  && (
  <Link to="/efetivo" onClick={handleClick} style={menuItem}>
  <Shield size={18}/>
  Efetivo
</Link>
)}
{user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN   && (
  <Link to="/agenda-create" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Criar Agenda
  </Link>
)}

{/* {user?.user?.role === Roles.ADMIN && ( */}
  <Link to="/agenda-police" onClick={handleClick} style={menuItem}>
    <Shield size={18}/>
    Minhas Visitas
  </Link>
{/* )} */}
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  && (
  <Link to="/women" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Mulheres
  </Link>
)}
  {user?.user?.role === Roles.ADMIN || user?.user?.role === Roles.SUPER_ADMIN  && (
  <Link to="/visitRequest" onClick={handleClick} style={menuItem}>
    <Users size={18}/>
    Solicitação de Visita
  </Link>
  )}


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
{/* {user?.user?.role === Roles.SUPER_ADMIN && (
  <Link to="/graduations" onClick={handleClick} style={menuItem}>
    <Siren size={18}/>
    Graduações
  </Link>
)} */}
{user?.user?.role === Roles.SUPER_ADMIN && (
  <Link to="/reports" onClick={handleClick} style={menuItem}>
    <FileText size={18}/>
    Relatórios
  </Link>
)}
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