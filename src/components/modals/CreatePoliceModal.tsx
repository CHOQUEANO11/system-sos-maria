/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

const ordemGraduacoes = [
  "SOLDADO",
  "CABO",
  "3º SARGENTO",
  "3° SARGENTO",
  "2º SARGENTO",
  "2° SARGENTO",
  "1º SARGENTO",
  "1° SARGENTO",
  "SUBTENENTE",
  "ASPIRANTE",
  "2º TENENTE",
  "2° TENENTE",
  "1º TENENTE",
  "1° TENENTE",
  "CAPITÃO",
  "CAPITAO",
  "MAJOR",
  "TEN CORONEL",
  "TENENTE CORONEL",
  "CORONEL"
]

function getPesoGraduacao(name?: string) {
  if (!name) return 999

  const normalized = name.trim().toUpperCase()
  const index = ordemGraduacoes.findIndex((item) => item === normalized)

  return index === -1 ? 999 : index
}

const initialForm = {
  name: "",
  nomeDeGuerra: "",
  cpf: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  unidadeId: "",
  graduacaoId: ""
}

export default function CreatePoliceModal({ isOpen, onClose, onCreated }: any) {
  const { user } = useAuth()

  const [unidades, setUnidades] = useState<any[]>([])
  const [graduacoes, setGraduacoes] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<any>(initialForm)

  const graduacoesOrdenadas = useMemo(() => {
    return [...graduacoes].sort((a: any, b: any) => {
      return getPesoGraduacao(a.name) - getPesoGraduacao(b.name)
    })
  }, [graduacoes])

  const loadData = async () => {
    const params: any = {}

    if (user?.role !== "SUPER_ADMIN") {
      params.municipalityId = user?.municipalityId
    }

    const [u, g] = await Promise.all([
      api.get("/unidades", { params }),
      api.get("/graduacoes")
    ])

    setUnidades(u.data)
    setGraduacoes(g.data)
  }

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm)
      loadData()
    }
  }, [isOpen])

  const handleCreate = async () => {
    if (saving) return

    if (
      !form.name ||
      !form.nomeDeGuerra ||
      !form.cpf ||
      !form.email ||
      !form.password ||
      !form.unidadeId ||
      !form.graduacaoId
    ) {
      alert("Preencha nome, nome de guerra, CPF, email, senha, unidade e graduação.")
      return
    }

    try {
      setSaving(true)

      await api.post("/police", {
        ...form,
        municipalityId: user?.municipalityId
      })

      await onCreated()
      onClose()
    } catch (error) {
      console.log(error)
      alert("Erro ao cadastrar policial.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Policial"
    >
      <input
        placeholder="Nome"
        style={styles.input}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Nome de Guerra"
        style={styles.input}
        value={form.nomeDeGuerra}
        onChange={(e) => setForm({ ...form, nomeDeGuerra: e.target.value })}
      />

      <input
        placeholder="CPF"
        style={styles.input}
        value={form.cpf}
        onChange={(e) => setForm({ ...form, cpf: e.target.value })}
      />

      <input
        placeholder="Email"
        style={styles.input}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Senha"
        type="password"
        style={styles.input}
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <input
        placeholder="Telefone"
        style={styles.input}
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <input
        placeholder="Endereço"
        style={styles.input}
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      <select
        style={styles.input}
        value={form.unidadeId}
        onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}
      >
        <option value="">Selecione a Unidade</option>

        {unidades.map((u: any) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      <select
        style={styles.input}
        value={form.graduacaoId}
        onChange={(e) => setForm({ ...form, graduacaoId: e.target.value })}
      >
        <option value="">Selecione a Graduação</option>

        {graduacoesOrdenadas.map((g: any) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleCreate}
        style={saving ? styles.btnDisabled : styles.btn}
        disabled={saving}
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </ModalBase>
  )
}

const styles: any = {
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
    marginBottom: 12
  },

  btn: {
    width: "100%",
    padding: 10,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 700
  },

  btnDisabled: {
    width: "100%",
    padding: 10,
    background: "#c7c7d1",
    color: "#666",
    border: "none",
    borderRadius: 6,
    cursor: "not-allowed",
    fontWeight: 700
  }
}
