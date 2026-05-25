import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../services/api"
import QRCode from "qrcode"
import bgLogin from "../assets/fundo.png"
import IMGLOGO from "../../public/sos2.png"
import { toast } from "react-toastify"
import { Copy, Eye, EyeOff, ShieldCheck } from "lucide-react"

export default function Login() {

  const navigate = useNavigate()
  const { login } = useAuth()

  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mfaStep, setMfaStep] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaCode, setMfaCode] = useState("")
  const [mfaToken, setMfaToken] = useState("")
  const [mfaSecret, setMfaSecret] = useState("")
  const [otpauthUrl, setOtpauthUrl] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [mfaSetupRequired, setMfaSetupRequired] = useState(false)
  

  const formatCPF = (value: string) => {

  const cpf = value
    .replace(/\D/g, "")   // remove não números
    .slice(0, 11)         // limita a 11 dígitos

  return cpf
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")

}

const cleanCPF = (value: string) => {
  return value.replace(/\D/g, "")
}

  const handleLogin = async () => {
    if (!cpf || !password) {
      toast.error("Preencha todos os campos")
      return
    }

    setLoading(true)

    const dados = {
      cpf: cleanCPF(cpf),
      password,
      clientType: "web"
    }

    try {

      const response = await api.post("/auth/login", dados)

      if (response.data.requiresMfa) {
        const otpauth = response.data.otpauthUrl || ""

        setMfaToken(response.data.mfaToken)
        setMfaSecret(response.data.mfaSecret || "")
        setOtpauthUrl(otpauth)
        setQrCodeUrl(otpauth ? await QRCode.toDataURL(otpauth, { width: 220, margin: 2 }) : "")
        setMfaSetupRequired(Boolean(response.data.mfaSetupRequired))
        setMfaStep(true)
        toast.info("Informe o código do autenticador para continuar.")
        return
      }

      login(response.data.token, response.data.user)
      toast.success(`Login realizado com sucesso, seja bem-vindo(a) ${response.data.user.name}!`)

      navigate("/dashboard")

    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error || "Erro ao realizar login")
    } finally {
    setLoading(false)
  }

  }

  const handleVerifyMfa = async () => {
    if (!mfaCode.trim()) {
      toast.warning("Informe o código do autenticador.")
      return
    }

    try {
      setMfaLoading(true)

      const response = await api.post("/auth/mfa/verify", {
        mfaToken,
        code: mfaCode
      })

      login(response.data.token, response.data.user)
      toast.success(`Login realizado com sucesso, seja bem-vindo(a) ${response.data.user.name}!`)
      navigate("/dashboard")
    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.error || "Código MFA inválido.")
    } finally {
      setMfaLoading(false)
    }
  }

  const copyMfaSecret = async () => {
    try {
      await navigator.clipboard.writeText(mfaSecret)
      toast.success("Chave MFA copiada.")
    } catch {
      toast.error("Não foi possível copiar a chave.")
    }
  }

  return (

    <div style={container}>

      {/* OVERLAY */}

      <div style={overlay}></div>

      {/* CARD LOGIN */}

      <div style={card}>

        <img src={IMGLOGO} alt="Logo SOS Maria" style={{ width: "100%", marginBottom: -10 }} />
        {/* <h2 style={title}>Gestão SOS</h2> */}

        <p style={subtitle}>
          Sistema de monitoramento e proteção
        </p>

        {!mfaStep ? (
          <>
            <input
              placeholder="CPF"
              value={cpf}
              onChange={(e)=>setCpf(formatCPF(e.target.value))}
              style={input}
            />

            <div style={passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                style={passwordInput}
              />

              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((value) => !value)}
                style={eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={19} color="#6b7280" />
                ) : (
                  <Eye size={19} color="#6b7280" />
                )}
              </button>
            </div>

            <button
              onClick={handleLogin}
              style={button}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </>
        ) : (
          <div style={mfaBox}>
            <div style={mfaHeader}>
              <ShieldCheck size={22} color="#ec4899" />
              <strong>Verificação em duas etapas</strong>
            </div>

            {mfaSetupRequired && (
              <div style={setupBox}>
                <p style={setupText}>
                  Abra o Google Authenticator, toque em adicionar conta e leia este QR Code:
                </p>

                {qrCodeUrl && (
                  <div style={qrBox}>
                    <img src={qrCodeUrl} alt="QR Code MFA" style={qrImage} />
                  </div>
                )}

                <p style={setupText}>
                  Se preferir, adicione a conta manualmente usando esta chave:
                </p>

                <div style={secretBox}>
                  <code style={secretText}>{mfaSecret}</code>
                  <button type="button" style={copyBtn} onClick={copyMfaSecret}>
                    <Copy size={15} />
                  </button>
                </div>

                <p style={setupText}>
                  Também é possível usar este URI no autenticador, se ele aceitar importação manual:
                </p>
                <code style={uriText}>{otpauthUrl}</code>
              </div>
            )}

            <div style={codeBoxes} onClick={() => document.getElementById("mfa-code-input")?.focus()}>
              {Array.from({ length: 6 }).map((_, index) => (
                <span
                  key={index}
                  style={{
                    ...codeBox,
                    ...(mfaCode.length === index ? codeBoxActive : {})
                  }}
                >
                  {mfaCode[index] || ""}
                </span>
              ))}

              <input
                id="mfa-code-input"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={hiddenCodeInput}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <button onClick={handleVerifyMfa} style={button} disabled={mfaLoading}>
              {mfaLoading ? "Validando..." : "Validar MFA"}
            </button>

            <button
              type="button"
              style={secondaryButton}
              onClick={() => {
                setMfaStep(false)
                setMfaCode("")
                setMfaToken("")
              }}
            >
              Voltar
            </button>
          </div>
        )}

      </div>

    </div>

  )

}

const container: React.CSSProperties = {

  width:"100%",
  height:"100vh",

  display:"flex",
  justifyContent:"center",
  alignItems:"center",

  backgroundImage: `url(${bgLogin})`,
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

  width: "min(92vw, 420px)",

  padding:35,

  background:"rgba(255,255,255,0.95)",

  borderRadius:14,

  boxShadow:"0 20px 40px rgba(0,0,0,0.25)",

  display:"flex",
  flexDirection:"column",
  gap:14

}

// const title: React.CSSProperties = {

//   textAlign:"center",
//   fontSize:26,
//   color:"#ec4899"

// }

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

const passwordField: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center"
}

const passwordInput: React.CSSProperties = {
  ...input,
  width: "100%",
  paddingRight: 44
}

const eyeButton: React.CSSProperties = {
  position: "absolute",
  right: 10,
  width: 32,
  height: 32,
  border: "none",
  borderRadius: 8,
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
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

const secondaryButton: React.CSSProperties = {
  padding: 12,
  border: "none",
  borderRadius: 8,
  background: "#f3f4f6",
  color: "#374151",
  fontWeight: 700,
  cursor: "pointer"
}

const mfaBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12
}

const mfaHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#111827"
}

const setupBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 12,
  borderRadius: 10,
  background: "#fdf2f8",
  border: "1px solid #fbcfe8"
}

const setupText: React.CSSProperties = {
  margin: 0,
  color: "#831843",
  fontSize: 12,
  lineHeight: 1.45
}

const qrBox: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: 10,
  borderRadius: 12,
  background: "#fff",
  border: "1px solid #f9a8d4"
}

const qrImage: React.CSSProperties = {
  width: 220,
  maxWidth: "100%",
  height: "auto",
  display: "block"
}

const secretBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 10px",
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #f9a8d4"
}

const secretText: React.CSSProperties = {
  flex: 1,
  color: "#111827",
  fontSize: 13,
  wordBreak: "break-all"
}

const copyBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  border: "none",
  borderRadius: 8,
  background: "#ec4899",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
}

const uriText: React.CSSProperties = {
  display: "block",
  maxHeight: 70,
  overflow: "auto",
  padding: 8,
  borderRadius: 8,
  background: "#fff",
  color: "#374151",
  fontSize: 11,
  lineHeight: 1.4,
  wordBreak: "break-all"
}

const codeBoxes: React.CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: 8,
  cursor: "text"
}

const codeBox: React.CSSProperties = {
  height: 48,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#111827",
  fontSize: 22,
  fontWeight: 900,
  boxShadow: "0 6px 14px rgba(15,23,42,0.06)"
}

const codeBoxActive: React.CSSProperties = {
  border: "2px solid #ec4899",
  boxShadow: "0 0 0 3px rgba(236,72,153,0.12)"
}

const hiddenCodeInput: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  opacity: 0,
  border: "none",
  outline: "none",
  cursor: "text"
}
