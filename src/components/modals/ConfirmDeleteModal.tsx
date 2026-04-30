/* eslint-disable @typescript-eslint/no-explicit-any */

import { AlertTriangle } from "lucide-react"
import ModalBase from "./ModalBase"

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  name,
  loading
}: any) {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Confirmar exclusão">
      <div style={styles.warningBox}>
        <div style={styles.iconBox}>
          <AlertTriangle size={22} />
        </div>

        <div>
          <p style={styles.text}>
            Tem certeza que deseja excluir <strong>{name}</strong>?
          </p>

          <p style={styles.helper}>
            O cadastro será desativado e deixará de aparecer nas listagens ativas.
          </p>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.cancel} onClick={onClose} disabled={loading}>
          Cancelar
        </button>

        <button
          style={loading ? styles.deleteDisabled : styles.delete}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Excluindo..." : "Excluir"}
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
    fontWeight: 700
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
