import { Menu } from "lucide-react"
import AvatarMenu from "./AvatarMenu"
import { useAuth } from "../context/AuthContext"

type HeaderProps = {
  toggle: () => void
}

export default function Header({ toggle }: HeaderProps) {

  const { user } = useAuth()

  return (

    <header
      style={{
        height: 70,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #eee"
      }}
    >

      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>

        <Menu size={22} onClick={toggle} style={{ cursor: "pointer" }} />

        <h2 style={{ color: "#ec4899" }}>
          Gestão SOS
        </h2>

      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>

        {/* Nome do usuário */}

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {user?.name}
          </div>

          <div style={{ fontSize: 12, color: "#888" }}>
            {user?.email}
          </div>
        </div>

        <AvatarMenu />

      </div>

    </header>

  )

}