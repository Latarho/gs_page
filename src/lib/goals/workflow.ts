import { cardId, QUARTERS, type Period } from "./period"
import type { CardsById, Employee, PerformanceCard, Role } from "./types"

export function otherRole(role: Role): Role {
  return role === "manager" ? "employee" : "manager"
}

/**
 * Правила доступа к карте по ролям.
 * Черновик виден только автору: пока одна сторона заполняет карту,
 * другая видит заглушку и не может создать свою поверх.
 */
export function cardAccess(stored: PerformanceCard | undefined, role: Role, creating: boolean) {
  const otherDraft = stored?.status === "draft" && stored.author !== role
  const ownDraft = stored?.status === "draft" && stored.author === role
  // Руководитель открывает пустой период сразу на создание, сотрудник — по кнопке
  const editing = ownDraft || (!stored && (role === "manager" || creating))
  const shown = stored && !otherDraft ? stored : null
  return { editing, shown, otherDraft }
}

/** Замечание к карте, адресованное этой роли */
export function returnNoteFor(card: PerformanceCard, role: Role) {
  return card.lastReturn && card.lastReturn.by !== role ? card.lastReturn : null
}

/**
 * Руководителю нужно создать и отправить карту на текущий квартал:
 * её нет или она ещё в его черновике. Только прямое подчинение.
 */
export function needsCreation(employee: Employee, cards: CardsById, now: Period, year: number) {
  if (year !== now.year || !employee.direct) return false
  const card = cards[cardId(employee.id, now.year, now.quarter)]
  return !card || (card.status === "draft" && card.author === "manager")
}

/** Сотрудник отправил руководителю свою карту за выбранный год */
export function awaitsAgreement(employee: Employee, cards: CardsById, year: number) {
  return QUARTERS.some((q) => {
    const card = cards[cardId(employee.id, year, q)]
    return card?.status === "approval" && card.author === "employee"
  })
}
