import { defaultZone } from "./directory"
import { cardId, previousPeriod } from "./period"
import { smartFailures } from "./smart"
import type { CardsById, DevTask, Employee, Kpi, PerformanceCard, Quarter, Role } from "./types"

/** Операции над картой результативности, не зависящие от интерфейса */

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function emptyKpi(zone: string): Kpi {
  return {
    id: newId("k"),
    name: "",
    weight: null,
    kind: "Основной",
    unit: "%",
    zone,
    plan: "",
    fact: "",
    value: "",
    score: null,
  }
}

export function emptyTask(partial: Partial<DevTask> = {}): DevTask {
  return {
    id: newId("t"),
    name: "",
    weight: null,
    expectedResult: "",
    selfResult: "",
    selfScore: null,
    managerResult: "",
    managerScore: null,
    ...partial,
  }
}

/** Пустая карта для создания: один КПЭ и типовая задача руководителя */
export function newCardTemplate(
  employee: Employee,
  year: number,
  quarter: Quarter,
  author: Role
): PerformanceCard {
  return {
    id: cardId(employee.id, year, quarter),
    employeeId: employee.id,
    year,
    quarter,
    status: "draft",
    author,
    goalGroup: employee.goalGroup,
    kpis: [emptyKpi(defaultZone(employee))],
    tasks: [
      emptyTask({
        name: "Выполнять задачи руководителя",
        weight: 20,
        expectedResult:
          "Поручения руководителя выполнены качественно и в полном объеме до конца квартала",
      }),
    ],
    updatedAt: "",
  }
}

/** Ближайшая предыдущая карта сотрудника (в пределах двух лет) */
export function findPreviousCard(cards: CardsById, employeeId: string, year: number, quarter: Quarter) {
  let period = { year, quarter }
  for (let i = 0; i < 8; i++) {
    period = previousPeriod(period)
    const card = cards[cardId(employeeId, period.year, period.quarter)]
    if (card) return card
  }
  return undefined
}

/** Показатели прошлой карты без результатов — основа для новой */
export function copyIndicators(source: PerformanceCard): Pick<PerformanceCard, "kpis" | "tasks"> {
  return {
    kpis: source.kpis.map((k) => ({ ...k, id: newId("k"), fact: "", value: "", score: null })),
    tasks: source.tasks.map((t) =>
      emptyTask({ name: t.name, weight: t.weight, expectedResult: t.expectedResult })
    ),
  }
}

/** Обновляет элемент списка КПЭ или ЗРД по id */
export function patchById<T extends { id: string }>(list: T[], id: string, patch: Partial<T>) {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function totalWeight(items: Array<Pick<Kpi | DevTask, "weight">>) {
  return items.reduce((sum, item) => sum + (item.weight ?? 0), 0)
}

/**
 * Итоговая оценка карты: средневзвешенное оценок КПЭ и
 * оценок руководителя по ЗРД. Null, если оценено не всё.
 */
export function cardScore(card: Pick<PerformanceCard, "kpis" | "tasks">): number | null {
  const parts = [
    ...card.kpis.map((k) => ({ weight: k.weight, score: k.score })),
    ...card.tasks.map((t) => ({ weight: t.weight, score: t.managerScore })),
  ]
  if (parts.length === 0 || parts.some((p) => p.score == null || p.weight == null)) {
    return null
  }
  const weight = totalWeight(parts)
  if (weight === 0) return null
  const sum = parts.reduce((acc, p) => acc + (p.weight ?? 0) * (p.score ?? 0), 0)
  return Math.round((sum / weight) * 1000) / 1000
}

/** Все ли КПЭ и ЗРД оценены руководителем */
export function isFullyAssessed(card: Pick<PerformanceCard, "kpis" | "tasks">) {
  return card.kpis.every((k) => k.score != null) && card.tasks.every((t) => t.managerScore != null)
}

/**
 * Проверка перед отправкой: ключи ошибок вида `${id}.${поле}`
 * для подсветки полей и общие сообщения для пользователя.
 */
export function validateIndicators(kpis: Kpi[], tasks: DevTask[]) {
  const errors: Record<string, true> = {}
  for (const k of kpis) {
    if (!k.name.trim()) errors[`${k.id}.name`] = true
    if (!k.weight || k.weight <= 0) errors[`${k.id}.weight`] = true
    if (!k.zone) errors[`${k.id}.zone`] = true
  }
  for (const t of tasks) {
    if (!t.name.trim()) errors[`${t.id}.name`] = true
    if (!t.weight || t.weight <= 0) errors[`${t.id}.weight`] = true
    if (!t.expectedResult.trim()) errors[`${t.id}.expectedResult`] = true
  }
  // SMART проверяем у заполненных ЗРД: пустые поля и так отмечены выше
  const notSmart: string[] = []
  tasks.forEach((t, i) => {
    if (!t.name.trim() || !t.expectedResult.trim()) return
    const failed = smartFailures(t)
    if (failed.length === 0) return
    errors[`${t.id}.smart`] = true
    notSmart.push(`№${kpis.length + i + 1} (${failed.map((c) => c.label.toLowerCase()).join(", ")})`)
  })

  const messages: string[] = []
  if (kpis.length + tasks.length === 0) messages.push("Добавьте хотя бы один КПЭ или ЗРД")
  if (Object.keys(errors).some((key) => !key.endsWith(".smart"))) {
    messages.push("Заполните обязательные поля, отмеченные красным")
  }
  if (notSmart.length > 0) {
    messages.push(`ЗРД не соответствуют SMART: ${notSmart.join("; ")}`)
  }
  const weight = totalWeight([...kpis, ...tasks])
  if (weight !== 100) messages.push(`Суммарный вес должен быть равен 100%, сейчас ${weight}%`)
  return { errors, messages }
}
