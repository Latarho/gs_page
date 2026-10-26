/** «97.273%» — точка как разделитель, до трёх знаков после неё */
export function formatPercent(value: number) {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 3, useGrouping: false })}%`
}

/** Процент или пустая строка, если значения нет */
export function formatOptionalPercent(value: number | null) {
  return value == null ? "" : `${value}%`
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
}

/** «Логинов Денис Викторович» → «ДЛ» */
export function initials(fullName: string) {
  const [last, first] = fullName.split(" ")
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`
}
