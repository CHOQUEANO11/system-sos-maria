 
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function EditWomanModal({ isOpen, onClose, onUpdated, woman }: any) {
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<any>({
    name: "",
    cpf: "",
    rg: "",
    email: "",
    phone: "",
    address: "",
    processNumber: ""
  })

  useEffect(() => {
    if (woman) {
      setForm({
        name: woman.name || "",
        cpf: woman.cpf || "",
        rg: woman.rg || "",
        email: woman.email || "",
        phone: woman.phone || "",
        address: woman.address || "",
        processNumber: woman.processNumber || ""
      })
    }
  }, [woman])

  async function handleUpdate() {
    if (!woman || saving) return

    if (!form.name || !form.cpf) {
      alert("Preencha nome e CPF.")
      return
    }

    try {
      setSaving(true)

      await api.put(`/users/${woman.id}`, form)

      await onUpdated()
      onClose()
    } catch (error) {
      console.log("Erro ao atualizar mulher", error)
      alert("Erro ao atualizar cadastro.")
    } finally {
      setSaving(false)
    }
  }

  if (!woman) return null

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Editar Mulher">
      <div style={styles.form}>
        <Input label="Nome" value={form.name} onChange={(value: string) => setForm({ ...form, name: value })} />
        <Input label="CPF" value={form.cpf} onChange={(value: string) => setForm({ ...form, cpf: value })} />
        <Input label="RG" value={form.rg} onChange={(value: string) => setForm({ ...form, rg: value })} />
        <Input label="Telefone" value={form.phone} onChange={(value: string) => setForm({ ...form, phone: value })} />
        <Input label="Email" value={form.email} onChange={(value: string) => setForm({ ...form, email: value })} />
        <Input label="Endereço" value={form.address} onChange={(value: string) => setForm({ ...form, address: value })} />
        <Input label="Número do Processo" value={form.processNumber} onChange={(value: string) => setForm({ ...form, processNumber: value })} />

        <button
          onClick={handleUpdate}
          style={saving ? styles.btnDisabled : styles.btn}
          disabled={saving}
        >
          {saving ? "Atualizando..." : "Atualizar Cadastro"}
        </button>
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

const styles: any = {
  form: {
    display: "grid",
    gap: 12
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
