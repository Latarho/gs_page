export type Quarter = 1 | 2 | 3 | 4

export interface Manager {
  id: string
  fullName: string
  initials: string
  /** Зона ответственности, подставляемая в новые КПЭ */
  zone: string
}

export interface Employee {
  id: string
  managerId: string
  fullName: string
  position: string
  department: string
  goalGroup: string
  /** Сотрудник прямого подчинения руководителя */
  direct: boolean
}

/**
 * Жизненный цикл карты результативности:
 * черновик → на акцептовании → активная → оценена
 */
export type CardStatus = "draft" | "approval" | "active" | "assessed"

export type KpiKind = "Основной" | "Дополнительный"

/** Ключевой показатель эффективности */
export interface Kpi {
  id: string
  name: string
  weight: number | null
  kind: KpiKind
  unit: string
  zone: string
  plan: string
  fact: string
  /** Значение выполнения КПЭ */
  value: string
  score: number | null
}

/** Задача развития деятельности */
export interface DevTask {
  id: string
  name: string
  weight: number | null
  expectedResult: string
  selfResult: string
  selfScore: number | null
  managerResult: string
  managerScore: number | null
}

/**
 * Кто создал карту. Карту руководителя акцептует сотрудник,
 * карту сотрудника согласует руководитель.
 */
export type CardAuthor = "manager" | "employee"

/** Роль пользователя, работающего с картой; совпадает с возможными авторами */
export type Role = CardAuthor

export interface PerformanceCard {
  id: string
  employeeId: string
  year: number
  quarter: Quarter
  status: CardStatus
  author: CardAuthor
  /** Последний возврат карты на доработку — показывается автору черновика */
  lastReturn?: { by: CardAuthor; comment: string; at: string }
  goalGroup: string
  kpis: Kpi[]
  tasks: DevTask[]
  updatedAt: string
}

export type CardsById = Record<string, PerformanceCard>
