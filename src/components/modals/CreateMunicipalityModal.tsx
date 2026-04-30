/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function CreateMunicipalityModal({ isOpen, onClose, onCreated }: any) {
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName("")
      setSaving(false)
    }
  }, [isOpen])

  const handleCreate = async () => {
    if (saving) return

    if (!name.trim()) {
      alert("Informe o nome do município.")
      return
    }

    try {
      setSaving(true)

      await api.post("/municipalities", {
        name: name.trim()
      })

      await onCreated()
      onClose()
    } catch (error) {
      console.log("Erro ao cadastrar município", error)
      alert("Erro ao cadastrar município.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Município"
    >
      <div style={styles.form}>
        <div>
          <label style={styles.label}>Nome do município</label>

          <input
            placeholder="Ex: Belém"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        <button
          onClick={handleCreate}
          style={saving ? styles.btnDisabled : styles.btn}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Município"}
        </button>
      </div>
    </ModalBase>
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
