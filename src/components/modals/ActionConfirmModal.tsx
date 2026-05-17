/* eslint-disable @typescript-eslint/no-explicit-any */

import { AlertTriangle } from "lucide-react"
import ModalBase from "./ModalBase"

export default function ActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  helper,
  confirmText = "Confirmar",
  loading,
  variant = "warning"
}: any) {
  const danger = variant === "danger"

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={title}>
      <div style={danger ? styles.dangerBox : styles.warningBox}>
        <div style={danger ? styles.dangerIcon : styles.warningIcon}>
          <AlertTriangle size={22} />
        </div>

        <div>
          <p style={danger ? styles.dangerText : styles.warningText}>
            {message}
          </p>

          {helper && (
            <p style={danger ? styles.dangerHelper : styles.warningHelper}>
              {helper}
            </p>
          )}
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.cancel} onClick={onClose} disabled={loading}>
          Cancelar
        </button>

        <button
          style={loading ? styles.confirmDisabled : danger ? styles.dangerConfirm : styles.warningConfirm}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Salvando..." : confirmText}
        </button>
      </div>
    </ModalBase>
  )
}

const styles: any = {
  warningBox: {
    display: "flex",
    gap: 12,
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20
  },

  dangerBox: {
    display: "flex",
    gap: 12,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20
  },

  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#fef3c7",
    color: "#d97706",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  dangerIcon: {
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

  warningText: {
    margin: 0,
    fontSize: 14,
    color: "#78350f",
    fontWeight: 800
  },

  dangerText: {
    margin: 0,
    fontSize: 14,
    color: "#7f1d1d",
    fontWeight: 800
  },

  warningHelper: {
    margin: "6px 0 0",
    color: "#92400e",
    fontSize: 13
  },

  dangerHelper: {
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

  warningConfirm: {
    padding: "10px 14px",
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },

  dangerConfirm: {
    padding: "10px 14px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 800
  },

  confirmDisabled: {
    padding: "10px 14px",
    border: "none",
    background: "#d1d5db",
    color: "#6b7280",
    borderRadius: 8,
    cursor: "not-allowed",
    fontWeight: 800
  }
}
