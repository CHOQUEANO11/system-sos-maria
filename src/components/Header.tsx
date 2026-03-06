import { Menu } from "lucide-react"
import AvatarMenu from "./AvatarMenu"

type HeaderProps = {
  toggle: () => void
}

export default function Header({ toggle }: HeaderProps) {

  return (

    <header
  style={{
    height:70,
    background:"#fff",
    display:"flex",
    alignItems:"center",
    justifyContent:"space-between",
    padding:"0 20px",
    borderBottom:"1px solid #eee"
  }}
>

      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>

        <Menu size={22} onClick={toggle} style={{ cursor: "pointer" }} />

        <h2 style={{ color: "#ec4899" }}>
          Gestão SOS
        </h2>

      </div>

      <AvatarMenu />

    </header>

  )

}