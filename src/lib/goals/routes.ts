import { formatPeriod } from "./period"
import type { Quarter } from "./types"

/** Адреса страниц целеполагания — собираются только здесь */
export const routes = {
  managerList(params: { managerId?: string; year?: number } = {}) {
    const search = new URLSearchParams()
    if (params.managerId) search.set("m", params.managerId)
    if (params.year) search.set("year", String(params.year))
    const query = search.toString()
    return query ? `/goals/cards?${query}` : "/goals/cards"
  },
  managerCard(employeeId: string, year: number, quarter: Quarter) {
    return `/goals/cards/${employeeId}/${formatPeriod(year, quarter)}`
  },
  myCards(period?: { year: number; quarter: Quarter }, create = false) {
    if (!period) return "/goals/my"
    return `/goals/my?p=${formatPeriod(period.year, period.quarter)}${create ? "&new=1" : ""}`
  },
}
