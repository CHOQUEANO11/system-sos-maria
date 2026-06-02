export function getApiErrorMessage(error: any, fallback = "Erro ao processar solicitação.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}
