 
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"
import { colorOptions, educationOptions, raceOptions } from "../../constants/demographics"

export default function EditWomanModal({ isOpen, onClose, onUpdated, woman }: any) {
  const [saving, setSaving] = useState(false)
  const [kinships, setKinships] = useState<any[]>([])

useEffect(() => {
  if (isOpen) {
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


  const [form, setForm] = useState<any>({
  name: "",
  cpf: "",
  rg: "",
  age: "",
  race: "",
  color: "",
  education: "",
  email: "",
  phone: "",
  address: "",
  processNumber: "",
  aggressorName: "",
  kinshipId: "",
  programStartDate: "",
  programEndDate: ""
})


  useEffect(() => {
    if (woman) {
      setForm({
  name: woman.name || "",
  cpf: woman.cpf || "",
  rg: woman.rg || "",
  age: woman.age || "",
  race: woman.race || "",
  color: woman.color || "",
  education: woman.education || "",
  email: woman.email || "",
  phone: woman.phone || "",
  address: woman.address || "",
  processNumber: woman.processNumber || "",
  aggressorName: woman.aggressorName || "",
  kinshipId: woman.kinshipId || woman.kinship?.id || "",
  programStartDate: toDateInput(woman.programStartDate),
  programEndDate: toDateInput(woman.programEndDate)
})

    }
  }, [woman])

  function toDateInput(value?: string) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}


  async function handleUpdate() {
    if (!woman || saving) return

    if (!form.name || !form.cpf) {
      toast.warning("Preencha nome e CPF.")
      return
    }

    try {
      setSaving(true)

      await api.put(`/users/${woman.id}`, {
        ...form,
        cpf: form.cpf.replace(/\D/g, ""),
        age: form.age ? Number(form.age) : null
      })

      await onUpdated()
      toast.success("Cadastro atualizado com sucesso.")
      onClose()
    } catch (error) {
      console.log("Erro ao atualizar mulher", error)
      toast.error("Erro ao atualizar cadastro.")
    } finally {
      setSaving(false)
    }
  }

  if (!woman) return null

  function formatCPF(value: string) {
  const numbers = value.replace(/\D/g, "")

  return numbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
    .slice(0, 14)
}


  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Editar Mulher">
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
      label="Idade"
      type="number"
      value={form.age}
      onChange={(value: string) => setForm({ ...form, age: value })}
    />

    <SelectInput
      label="Raça"
      value={form.race}
      options={raceOptions}
      onChange={(value: string) => setForm({ ...form, race: value })}
    />

    <SelectInput
      label="Cor"
      value={form.color}
      options={colorOptions}
      onChange={(value: string) => setForm({ ...form, color: value })}
    />

    <SelectInput
      label="Escolaridade"
      value={form.education}
      options={educationOptions}
      onChange={(value: string) => setForm({ ...form, education: value })}
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
      onChange={(value: string) => setForm({ ...form, processNumber: value })}
    />

    <Input
      label="Nome do acusado"
      value={form.aggressorName}
      onChange={(value: string) => setForm({ ...form, aggressorName: value })}
    />

    <div>
      <label style={styles.label}>Grau de parentesco</label>

      <select
        style={styles.input}
        value={form.kinshipId}
        onChange={(e) => setForm({ ...form, kinshipId: e.target.value })}
      >
        <option value="">Selecione...</option>

        {kinships.map((item: any) => (
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
      onClick={handleUpdate}
      style={saving ? styles.btnDisabled : styles.btn}
      disabled={saving}
    >
      {saving ? "Atualizando..." : "Atualizar Cadastro"}
    </button>
  </div>
  </div>
</ModalBase>

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


function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        placeholder={label}
        style={styles.input}
        value={value}
        min={type === "number" ? 0 : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function SelectInput({ label, value, options, onChange }: any) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <select
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecione...</option>

        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
    background: "#6366f1",
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
