/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Save, UserRound } from "lucide-react"
import { api } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<any>({
    name: "",
    nomeDeGuerra: "",
    email: "",
    phone: "",
    address: "",
    password: ""
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        nomeDeGuerra: user.nomeDeGuerra || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        password: ""
      })
    }
  }, [user])

  async function handleSave() {
    if (!user || saving) return

    if (!form.name || !form.email) {
      alert("Nome e email são obrigatórios.")
      return
    }

    try {
      setSaving(true)

      const payload: any = {
        name: form.name,
        nomeDeGuerra: form.nomeDeGuerra,
        email: form.email,
        phone: form.phone,
        address: form.address
      }

      if (form.password) {
        payload.password = form.password
      }

      await api.put(`/users/${user.id}`, payload)

      alert("Perfil atualizado com sucesso")
      navigate("/dashboard")
    } catch (error) {
      console.log("Erro ao atualizar perfil", error)
      alert("Erro ao atualizar perfil")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.iconBox}>
          <UserRound size={24} />
        </div>

        <div>
          <h2 style={styles.title}>Meu Perfil</h2>
          <p style={styles.subtitle}>
            Atualize seus dados de acesso e informações pessoais.
          </p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.grid}>
          <Input
            label="Nome"
            value={form.name}
            onChange={(value: string) => setForm({ ...form, name: value })}
          />

          <Input
            label="Nome de Guerra"
            value={form.nomeDeGuerra}
            onChange={(value: string) => setForm({ ...form, nomeDeGuerra: value })}
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(value: string) => setForm({ ...form, email: value })}
          />

          <Input
            label="Telefone"
            value={form.phone}
            onChange={(value: string) => setForm({ ...form, phone: value })}
          />

          <Input
            label="Endereço"
            value={form.address}
            onChange={(value: string) => setForm({ ...form, address: value })}
          />

          <Input
            label="Nova senha"
            type="password"
            value={form.password}
            placeholder="Deixe em branco para manter a senha atual"
            onChange={(value: string) => setForm({ ...form, password: value })}
          />
        </div>

        <div style={styles.actions}>
          <button
            style={styles.cancelBtn}
            onClick={() => navigate("/dashboard")}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            style={saving ? styles.saveBtnDisabled : styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={17} />
            {saving ? "Salvando..." : "Salvar Perfil"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <input
        type={type}
        value={value}
        placeholder={placeholder || label}
        style={styles.input}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

const styles: any = {
  container: {
    width: "100%"
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#fdf2f8",
    color: "#db2777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: 26,
    fontWeight: 800
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14
  },

  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 28px rgba(15,23,42,0.06)"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 16
  },

  label: {
    display: "block",
    marginBottom: 6,
    color: "#374151",
    fontSize: 13,
    fontWeight: 800
  },

  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 9,
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    outline: "none",
    fontSize: 14
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 24,
    flexWrap: "wrap"
  },

  cancelBtn: {
    padding: "11px 16px",
    borderRadius: 9,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 800
  },

  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    borderRadius: 9,
    border: "none",
    background: "#ec4899",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800
  },

  saveBtnDisabled: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    borderRadius: 9,
    border: "none",
    background: "#d1d5db",
    color: "#6b7280",
    cursor: "not-allowed",
    fontWeight: 800
  }
}
