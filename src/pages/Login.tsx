import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {

  const navigate = useNavigate()

  const [cpf,setCpf] = useState("")
  const [password,setPassword] = useState("")

  const handleLogin = () => {

    if(cpf && password){
      navigate("/dashboard")
    }

  }

  return (

    <div style={container}>

      {/* OVERLAY */}

      <div style={overlay}></div>

      {/* CARD LOGIN */}

      <div style={card}>

        <h2 style={title}>Gestão SOS</h2>

        <p style={subtitle}>
          Sistema de monitoramento e proteção
        </p>

        <input
          placeholder="CPF"
          value={cpf}
          onChange={(e)=>setCpf(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={input}
        />

        <button
          onClick={handleLogin}
          style={button}
        >
          Entrar
        </button>

      </div>

    </div>

  )

}

const container: React.CSSProperties= {

  width:"100%",
  height:"100vh",

  display:"flex",
  justifyContent:"center",
  alignItems:"center",

  backgroundImage:
  "url('https://images.unsplash.com/photo-1508780709619-79562169bc64')",

  backgroundSize:"cover",
  backgroundPosition:"center",

  position:"relative"

}

const overlay: React.CSSProperties = {

  position:"absolute",
  inset:0,

  background:
  "linear-gradient(135deg, rgba(236,72,153,0.75), rgba(168,85,247,0.75))"

}

const card: React.CSSProperties = {

  position:"relative",

  width:340,

  padding:35,

  background:"rgba(255,255,255,0.95)",

  borderRadius:14,

  boxShadow:"0 20px 40px rgba(0,0,0,0.25)",

  display:"flex",
  flexDirection:"column",
  gap:14

}

const title: React.CSSProperties = {

  textAlign:"center",
  fontSize:26,
  color:"#ec4899"

}

const subtitle: React.CSSProperties = {

  textAlign:"center",
  fontSize:14,
  color:"#6b7280",
  marginBottom:10

}

const input: React.CSSProperties = {

  padding:"12px 14px",

  borderRadius:8,

  border:"1px solid #e5e7eb",

  outline:"none",

  fontSize:14

}

const button: React.CSSProperties = {

  padding:12,

  border:"none",

  borderRadius:8,

  background:"#ec4899",

  color:"#fff",

  fontWeight:600,

  cursor:"pointer",

  marginTop:10

}