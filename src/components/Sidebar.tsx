/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */

import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Shield,
  Siren,
  FileText,
  Building2,
  MapPinned,
  CalendarPlus,
  ClipboardList
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import IMG2 from "../../public/sos2.png"

type SidebarProps = {
  open: boolean
  mobile: boolean
  toggle: () => void
}

export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  WOMAN: "WOMAN",
  POLICE: "POLICE"
}

export type Roles = (typeof Roles)[keyof typeof Roles]

export default function Sidebar({ open, mobile, toggle }: SidebarProps) {
  const auth = useAuth()
  const role = auth?.user?.role

  const isAdmin = role === Roles.ADMIN
  const isSuperAdmin = role === Roles.SUPER_ADMIN
  const isAdminOrSuper = isAdmin || isSuperAdmin

  const handleClick = () => {
    if (mobile) {
      toggle()
    }
  }

  const menuItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      show: true
    },
    {
      label: "Admins",
      to: "/admins",
      icon: Shield,
      show: isAdminOrSuper
    },
    {
      label: "Efetivo",
      to: "/efetivo",
      icon: Shield,
      show: isAdminOrSuper
    },
    {
      label: "Criar Agenda",
      to: "/agenda-create",
      icon: CalendarPlus,
      show: isAdminOrSuper
    },
    {
      label: "Minhas Visitas",
      to: "/agenda-police",
      icon: ClipboardList,
      show: true
    },
    {
      label: "Mulheres",
      to: "/women",
      icon: Users,
      show: isAdminOrSuper
    },
    {
      label: "Solicitação de Visita",
      to: "/visitRequest",
      icon: Users,
      show: isAdminOrSuper
    },
    {
      label: "Pedidos de Ajuda",
      to: "/emergencies",
      icon: Siren,
      show: true
    },
    {
      label: "Municípios",
      to: "/municipalities",
      icon: MapPinned,
      show: isSuperAdmin
    },
    {
      label: "Unidades",
      to: "/units",
      icon: Building2,
      show: isSuperAdmin
    },
    {
      label: "Relatórios",
      to: "/reports",
      icon: FileText,
      show: isSuperAdmin
    }
  ]

  return (
    <aside
      style={{
        ...styles.sidebar,
        ...(mobile ? styles.mobileSidebar : styles.desktopSidebar),
        ...(mobile
          ? { left: open ? 0 : -260 }
          : { width: open ? 220 : 72 })
      }}
    >
      <div style={styles.logoArea}>
        <Link to="/dashboard" onClick={handleClick} style={styles.logoLink}>
          <img
            src={IMG2}
            alt="Logo SOS Maria"
            style={{
              ...styles.logo,
              display: mobile || open ? "block" : "none"
            }}
          />
        </Link>
      </div>

      <nav style={styles.nav}>
        {menuItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleClick}
                title={!mobile && !open ? item.label : undefined}
                style={{
                  ...styles.menuItem,
                  justifyContent: !mobile && !open ? "center" : "flex-start"
                }}
              >
                <Icon size={18} />
                {(mobile || open) && <span>{item.label}</span>}
              </Link>
            )
          })}
      </nav>
    </aside>
  )
}

const styles: any = {
  sidebar: {
    background: "#fff",
    borderRight: "1px solid #eee",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  mobileSidebar: {
    position: "fixed",
    top: 0,
    bottom: 0,
    width: 260,
    height: "100dvh",
    transition: "left .3s ease"
  },

  desktopSidebar: {
    position: "sticky",
    top: 0,
    height: "100vh",
    transition: "width .3s ease",
    flexShrink: 0
  },

  logoArea: {
    flexShrink: 0,
    padding: "18px 16px 12px",
    borderBottom: "1px solid #f3f4f6"
  },

  logoLink: {
    display: "block",
    textDecoration: "none"
  },

  logo: {
    width: "100%",
    maxHeight: 95,
    objectFit: "contain"
  },

  nav: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "14px 10px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    WebkitOverflowScrolling: "touch"
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 42,
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#374151",
    fontWeight: 700,
    fontSize: 14,
    transition: "0.2s",
    flexShrink: 0,
    whiteSpace: "nowrap"
  }
}
