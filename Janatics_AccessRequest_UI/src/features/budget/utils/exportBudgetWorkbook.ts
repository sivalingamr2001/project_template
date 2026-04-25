import { api } from "@/shared/lib/api-client"

function resolveFileName(
  contentDisposition?: string,
  fallback = "budget-report.xlsx"
) {
  if (!contentDisposition) {
    return fallback
  }

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1])
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  return plainMatch?.[1] ?? fallback
}

export async function exportBudgetWorkbook(budgetId: number) {
  const response = await api.get(`/budgets/${budgetId}/export`, {
    responseType: "blob",
  })

  const blob = new Blob([response.data], {
    type:
      response.headers["content-type"] ??
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = downloadUrl
  link.download = resolveFileName(response.headers["content-disposition"])
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(downloadUrl)
}
