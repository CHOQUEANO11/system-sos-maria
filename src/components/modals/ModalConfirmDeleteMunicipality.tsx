/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import ModalBase from "./ModalBase"
import { api } from "../../services/api"

export default function DeleteMunicipalityModal({
  isOpen,
  onClose,
  municipality,
  onDeleted
}: any) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (deleting) return
    if (!municipality) return

    try {
      setDeleting(true)

      await api.delete(`/municipalities/${municipality.id}`)

      await onDeleted()
      onClose()
    } catch (error) {
      console.log("Erro ao excluir município", error)
      alert("Erro ao excluir município.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Município"
    >
      <div style={styles.warningBox}>
        <div style={styles.iconBox}>
          <AlertTriangle size={22} />
        </div>

        <div>
          <p style={styles.text}>
            Deseja realmente excluir o município
            <strong> {municipality?.name}</strong>?
          </p>

          <p style={styles.helper}>
            Essa ação pode afetar unidades e usuários vinculados a este município.
          </p>
        </div>
      </div>

      <div style={styles.actions}>
        <button
          style={styles.cancel}
          onClick={onClose}
          disabled={deleting}
        >
          Cancelar
        </button>

        <button
          style={deleting ? styles.deleteDisabled : styles.delete}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>
    </ModalBase>
  )
}

const styles: any = {
  warningBox: {
    display: "flex",
    gap: 12,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#fee2e2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  text: {
    margin: 0,
    fontSize: 14,
    color: "#7f1d1d",
    fontWeight: 600
  },

  helper: {
    margin: "6px 0 0",
    color: "#991b1b",
    fontSize: 13
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap"
  },

  cancel: {
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },

  delete: {
    padding: "10px 14px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },

  deleteDisabled: {
    padding: "10px 14px",
    border: "none",
    background: "#d1d5db",
    color: "#6b7280",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 800
  }
}
