import { initials } from "@/lib/format"
import { CURRENT_EMPLOYEE_ID, CURRENT_USER, EMPLOYEES, KPI_ZONES, MANAGERS } from "./mock-data"
import type { Employee, KpiKind, Role } from "./types"

/**
 * Справочники: сотрудники, руководители, значения для КПЭ.
 * Сейчас читают мок; при подключении бэкенда меняется только этот модуль.
 */

export { KPI_UNITS, KPI_ZONES, MANAGERS } from "./mock-data"

export const KPI_KINDS: KpiKind[] = ["Основной", "Дополнительный"]

export function getEmployee(id: string) {
  return EMPLOYEES.find((e) => e.id === id)
}

export function getManager(id: string) {
  return MANAGERS.find((m) => m.id === id)
}

export function employeesOf(managerId: string) {
  return EMPLOYEES.filter((e) => e.managerId === managerId)
}

export const ALL_EMPLOYEES_COUNT = EMPLOYEES.length

/** Зона ответственности по умолчанию для новых КПЭ сотрудника */
export function defaultZone(employee: Employee) {
  return getManager(employee.managerId)?.zone ?? KPI_ZONES[0]
}

/** Демо-пользователи, от лица которых можно открыть приложение */
export const DEMO_USERS: Record<Role, { name: string; initials: string; title: string }> = {
  manager: { name: CURRENT_USER.fullName, initials: CURRENT_USER.initials, title: CURRENT_USER.role },
  employee: {
    name: currentEmployee().fullName,
    initials: initials(currentEmployee().fullName),
    title: "Сотрудник",
  },
}

export function currentEmployee() {
  return getEmployee(CURRENT_EMPLOYEE_ID)!
}
