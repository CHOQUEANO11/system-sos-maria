 
 
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

const initialForm = {
  name: "",
  address: "",
  phone: "",
  municipalityId: ""
}

export default function CreateUnidadeModal({ isOpen, onClose, onCreated }: any) {
  const [municipalities, setMunicipalities] = useState<any[]>([])
  const [form, setForm] = useState<any>(initialForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)

      const res = await api.get("/municipalities")
      setMunicipalities(res.data.data || res.data || [])
    } catch (error) {
      console.log("Erro ao carregar municípios", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm)
      load()
    }
  }, [isOpen])

  const handleCreate = async () => {
    if (saving) return

    if (!form.name || !form.municipalityId) {
      alert("Preencha o nome e selecione o município.")
      return
    }

    try {
      setSaving(true)

      await api.post("/unidades", form)

      await onCreated()
      onClose()
    } catch (error) {
      console.log("Erro ao cadastrar unidade", error)
      alert("Erro ao cadastrar unidade.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Cadastrar Unidade">
      <div style={styles.form}>
        <div>
          <label style={styles.label}>Nome da unidade</label>
          <input
            placeholder="Ex: 1ª Companhia"
            style={styles.input}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label style={styles.label}>Endereço</label>
          <input
            placeholder="Rua, número, bairro"
            style={styles.input}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div>
          <label style={styles.label}>Telefone</label>
          <input
            placeholder="(00) 00000-0000"
            style={styles.input}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label style={styles.label}>Município</label>
          <select
            style={styles.input}
            value={form.municipalityId}
            onChange={(e) => setForm({ ...form, municipalityId: e.target.value })}
            disabled={loading}
          >
            <option value="">
              {loading ? "Carregando municípios..." : "Selecione o Município"}
            </option>

            {municipalities.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreate}
          style={saving ? styles.btnDisabled : styles.btn}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar Unidade"}
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
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 800,
    marginTop: 4
  },

  btnDisabled: {
    width: "100%",
    padding: "12px",
    background: "#d1d5db",
    color: "#6b7280",
    border: "none",
    borderRadius: 9,
    cursor: "not-allowed",
    fontWeight: 800,
    marginTop: 4
  }
}
