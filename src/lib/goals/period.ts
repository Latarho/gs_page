import type { Quarter } from "./types"

export const QUARTERS: Quarter[] = [1, 2, 3, 4]

/** Годы, доступные для выбора */
export const YEARS = [2025, 2026]

export interface Period {
  year: number
  quarter: Quarter
}

export function formatPeriod(year: number, quarter: Quarter) {
  return `${quarter}Q${year}`
}

/** Разбирает строку вида «3Q2026» */
export function parsePeriod(value: string): Period | null {
  const match = /^([1-4])Q(\d{4})$/.exec(value)
  if (!match) return null
  return { quarter: Number(match[1]) as Quarter, year: Number(match[2]) }
}

export function cardId(employeeId: string, year: number, quarter: Quarter) {
  return `${employeeId}:${formatPeriod(year, quarter)}`
}

export function currentPeriod(date = new Date()): Period {
  return {
    year: date.getFullYear(),
    quarter: (Math.floor(date.getMonth() / 3) + 1) as Quarter,
  }
}

/** Последний день квартала: «31.12.2026» */
export function quarterEndDate(year: number, quarter: Quarter) {
  const lastDay = new Date(year, quarter * 3, 0)
  return lastDay.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function previousPeriod({ year, quarter }: Period): Period {
  return quarter === 1 ? { year: year - 1, quarter: 4 } : { year, quarter: (quarter - 1) as Quarter }
}
