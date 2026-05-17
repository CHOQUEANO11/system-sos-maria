/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
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

export default function EditPoliceModal({ isOpen, onClose, onUpdated, police }: any) {
  const { user } = useAuth()

  const [unidades, setUnidades] = useState<any[]>([])
  const [graduacoes, setGraduacoes] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<any>({
    name: "",
    nomeDeGuerra: "",
    cpf: "",
    email: "",
    phone: "",
    address: "",
    unidadeId: "",
    graduacaoId: ""
  })

  const graduacoesOrdenadas = useMemo(() => {
    return [...graduacoes].sort((a: any, b: any) => getPesoGraduacao(a.name) - getPesoGraduacao(b.name))
  }, [graduacoes])

  useEffect(() => {
    if (isOpen && police) {
      setForm({
        name: police.name || "",
        nomeDeGuerra: police.nomeDeGuerra || "",
        cpf: police.cpf || "",
        email: police.email || "",
        phone: police.phone || "",
        address: police.address || "",
        unidadeId: police.policeProfile?.unidadeId || police.policeProfile?.unidade?.id || police.unidadeId || "",
        graduacaoId: police.policeProfile?.graduacaoId || police.policeProfile?.graduacao?.id || ""
      })
      loadData()
    }
  }, [isOpen, police])

  async function loadData() {
    const params: any = {}

    if (user?.role !== "SUPER_ADMIN") {
      params.municipalityId = user?.municipalityId
    }

    try {
      const [u, g] = await Promise.all([
        api.get("/unidades", { params }),
        api.get("/graduacoes")
      ])

      setUnidades(u.data || [])
      setGraduacoes(g.data || [])
    } catch (error) {
      console.log("Erro ao carregar dados do efetivo", error)
      toast.error("Erro ao carregar unidades e graduações.")
    }
  }

  async function handleUpdate() {
    if (!police || saving) return

    if (!form.name || !form.nomeDeGuerra || !form.cpf || !form.email || !form.unidadeId || !form.graduacaoId) {
      toast.warning("Preencha nome, nome de guerra, CPF, email, unidade e graduação.")
      return
    }

    try {
      setSaving(true)

      await api.put(`/users/${police.id}`, {
        ...form,
        cpf: form.cpf.replace(/\D/g, "")
      })

      await onUpdated()
      toast.success("Policial atualizado com sucesso.")
      onClose()
    } catch (error) {
      console.log("Erro ao atualizar policial", error)
      toast.error("Erro ao atualizar policial.")
    } finally {
      setSaving(false)
    }
  }

  if (!police) return null

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Editar Policial">
      <input placeholder="Nome" style={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Nome de Guerra" style={styles.input} value={form.nomeDeGuerra} onChange={(e) => setForm({ ...form, nomeDeGuerra: e.target.value })} />
      <input placeholder="CPF" style={styles.input} value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
      <input placeholder="Email" style={styles.input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Telefone" style={styles.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input placeholder="Endereço" style={styles.input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

      <select style={styles.input} value={form.unidadeId} onChange={(e) => setForm({ ...form, unidadeId: e.target.value })}>
        <option value="">Selecione a Unidade</option>
        {unidades.map((u: any) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>

      <select style={styles.input} value={form.graduacaoId} onChange={(e) => setForm({ ...form, graduacaoId: e.target.value })}>
        <option value="">Selecione a Graduação</option>
        {graduacoesOrdenadas.map((g: any) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      <button onClick={handleUpdate} style={saving ? styles.btnDisabled : styles.btn} disabled={saving}>
        {saving ? "Atualizando..." : "Atualizar"}
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
