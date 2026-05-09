/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

const initialForm = {
  name: "",
  rg: "",
  cpf: "",
  email: "",
  phone: "",
  address: "",
  processNumber: "",
  aggressorName: "",
  kinshipId: "",
  programStartDate: "",
  programEndDate: ""
}

export default function CreateWomanModal({ isOpen, onClose, onCreated }: any) {
  const { user } = useAuth()

  const [form, setForm] = useState<any>(initialForm)
  const [kinships, setKinships] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm)
      setSaving(false)
      loadKinships()
    }
  }, [isOpen])

  async function loadKinships() {
    try {
      const { data } = await api.get("/kinships")
      setKinships(data || [])
    } catch (error) {
      console.log("Erro ao carregar parentescos", error)
    }
  }

  async function handleCreate() {
    if (saving) return

    if (!user) return

    if (!form.name || !form.cpf) {
      alert("Preencha nome e CPF.")
      return
    }

    try {
      setSaving(true)

      await api.post("/users", {
        ...form,
        cpf: form.cpf.replace(/\D/g, ""),
        password: "maria@2026",
        role: "WOMAN",
        municipalityId: user.municipalityId,
        unidadeId: user.unidadeId
      })

      await onCreated()
      onClose()
    } catch (error) {
      console.log("Erro ao cadastrar mulher", error)
      alert("Erro ao cadastrar.")
    } finally {
      setSaving(false)
    }
  }

  function formatCPF(value: string) {
  const numbers = value.replace(/\D/g, "")

  return numbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
    .slice(0, 14)
}


  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Cadastrar Mulher">
      <div style={styles.scrollArea}>
      <div style={styles.form}>
        <Input
          label="Nome"
          value={form.name}
          onChange={(value: string) => setForm({ ...form, name: value })}
        />

        <Input
  label="CPF"
  value={form.cpf}
  onChange={(value: string) =>
    setForm({ ...form, cpf: formatCPF(value) })
  }
/>


        <Input
          label="RG"
          value={form.rg}
          onChange={(value: string) => setForm({ ...form, rg: value })}
        />

        <Input
          label="Telefone"
          value={form.phone}
          onChange={(value: string) => setForm({ ...form, phone: value })}
        />

        <Input
          label="Email"
          value={form.email}
          onChange={(value: string) => setForm({ ...form, email: value })}
        />

        <Input
          label="Endereço"
          value={form.address}
          onChange={(value: string) => setForm({ ...form, address: value })}
        />

        <Input
          label="Número do Processo"
          value={form.processNumber}
          onChange={(value: string) =>
            setForm({ ...form, processNumber: value })
          }
        />

        <Input
          label="Nome do acusado"
          value={form.aggressorName}
          onChange={(value: string) =>
            setForm({ ...form, aggressorName: value })
          }
        />

        <div>
          <label style={styles.label}>Grau de parentesco</label>

          <select
            style={styles.input}
            value={form.kinshipId}
            onChange={(e) =>
              setForm({ ...form, kinshipId: e.target.value })
            }
          >
            <option value="">Selecione...</option>

            {kinships.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <DateInput
          label="Data de início do programa"
          value={form.programStartDate}
          onChange={(value: string) =>
            setForm({ ...form, programStartDate: value })
          }
        />

        <DateInput
          label="Data de término do programa"
          value={form.programEndDate}
          onChange={(value: string) =>
            setForm({ ...form, programEndDate: value })
          }
        />

        <button
          onClick={handleCreate}
          style={saving ? styles.btnDisabled : styles.btn}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Cadastro"}
        </button>
      </div>
      </div>
    </ModalBase>
  )
}

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <input
        placeholder={label}
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function DateInput({ label, value, onChange }: any) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <input
        type="date"
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
      />
    </div>
  )
}

const styles: any = {
  form: {
    display: "grid",
    gap: 12
  },

  scrollArea: {
  maxHeight: "calc(100vh - 140px)",
  overflowY: "auto",
  paddingRight: 6
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

  btn: {
    width: "100%",
    padding: "12px",
    background: "#ec4899",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 800
  },

  btnDisabled: {
    width: "100%",
    padding: "12px",
    background: "#d1d5db",
    color: "#6b7280",
    border: "none",
    borderRadius: 9,
    cursor: "not-allowed",
    fontWeight: 800
  }
}
