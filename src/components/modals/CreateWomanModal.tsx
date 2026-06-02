/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { colorOptions, educationOptions, raceOptions } from "../../constants/demographics"
import { getNeighborhoodSuggestions } from "../../constants/neighborhoods"
import { getApiErrorMessage } from "../../utils/apiError"

const initialForm = {
  name: "",
  rg: "",
  age: "",
  race: "",
  color: "",
  education: "",
  cpf: "",
  email: "",
  phone: "",
  address: "",
  neighborhood: "",
  municipalityId: "",
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
  const [municipalities, setMunicipalities] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm)
      setSaving(false)
      loadOptions()
    }
  }, [isOpen])

  async function loadOptions() {
    try {
      const [kinshipsRes, municipalitiesRes] = await Promise.all([
        api.get("/kinships"),
        api.get("/municipalities", { params: { limit: 9999 } })
      ])

      const loadedMunicipalities = normalizeList(municipalitiesRes.data)
      const visibleMunicipalities =
        user?.role === "SUPER_ADMIN"
          ? loadedMunicipalities
          : loadedMunicipalities.filter((item: any) => item.id === user?.municipalityId)

      setKinships(kinshipsRes.data || [])
      setMunicipalities(visibleMunicipalities)
      setForm({
        ...initialForm,
        municipalityId: user?.role === "SUPER_ADMIN" ? "" : user?.municipalityId || ""
      })
    } catch (error) {
      console.log("Erro ao carregar opções do cadastro", error)
    }
  }

  function normalizeList(data: any) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    return []
  }

  const selectedMunicipality = municipalities.find((item) => item.id === form.municipalityId)
  const neighborhoodSuggestions = getNeighborhoodSuggestions(selectedMunicipality?.name)

  async function handleCreate() {
    if (saving) return

    if (!user) return

    if (!form.name || !form.cpf) {
      toast.warning("Preencha nome e CPF.")
      return
    }

    if (!form.municipalityId) {
      toast.warning("Selecione o município.")
      return
    }

    try {
      setSaving(true)

      await api.post("/users", {
        ...form,
        cpf: form.cpf.replace(/\D/g, ""),
        age: form.age ? Number(form.age) : null,
        password: "maria@2026",
        role: "WOMAN",
        municipalityId: form.municipalityId || user.municipalityId,
        unidadeId: user.unidadeId
      })

      await onCreated()
      toast.success("Mulher cadastrada com sucesso.")
      onClose()
    } catch (error) {
      console.log("Erro ao cadastrar mulher", error)
      toast.error(getApiErrorMessage(error, "Erro ao cadastrar mulher."))
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

        <div>
          <label style={styles.label}>Município</label>

          <select
            style={styles.input}
            value={form.municipalityId}
            onChange={(e) =>
              setForm({ ...form, municipalityId: e.target.value, neighborhood: "" })
            }
          >
            <option value="">Selecione...</option>

            {municipalities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Bairro"
          value={form.neighborhood}
          list="create-woman-neighborhoods"
          onChange={(value: string) => setForm({ ...form, neighborhood: value })}
        />

        <datalist id="create-woman-neighborhoods">
          {neighborhoodSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

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

function Input({ label, value, onChange, type = "text", list }: any) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <input
        type={type}
        placeholder={label}
        style={styles.input}
        value={value}
        list={list}
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
