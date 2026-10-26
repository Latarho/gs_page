"use client"

import { useState } from "react"
import type { CardStage } from "@/lib/goals/status"
import type { Employee } from "@/lib/goals/types"

/** Быстрый фильтр: стадия карты в сводке или одно из ожидаемых действий */
export type QuickFilter = { kind: "stage"; stage: CardStage } | { kind: "toCreate" } | { kind: "toAgree" }

export function sameQuickFilter(a: QuickFilter | null, b: QuickFilter) {
  return a?.kind === b.kind && (a.kind !== "stage" || (b.kind === "stage" && a.stage === b.stage))
}

export interface ColumnFilters {
  groups: string[]
  positions: string[]
  departments: string[]
  name: string
}

const NO_COLUMN_FILTERS: ColumnFilters = { groups: [], positions: [], departments: [], name: "" }

/**
 * Фильтры таблицы сотрудников: по колонкам и быстрый фильтр.
 * matchesQuick решает, подходит ли сотрудник под быстрый фильтр.
 */
export function useEmployeeFilters(
  employees: Employee[],
  matchesQuick: (employee: Employee, filter: QuickFilter) => boolean
) {
  const [columns, setColumns] = useState(NO_COLUMN_FILTERS)
  const [quick, setQuick] = useState<QuickFilter | null>(null)

  const query = columns.name.trim().toLowerCase()
  const rows = employees.filter(
    (e) =>
      (columns.groups.length === 0 || columns.groups.includes(e.goalGroup)) &&
      (columns.positions.length === 0 || columns.positions.includes(e.position)) &&
      (columns.departments.length === 0 || columns.departments.includes(e.department)) &&
      (!query || e.fullName.toLowerCase().includes(query)) &&
      (!quick || matchesQuick(e, quick))
  )

  const active =
    columns.groups.length + columns.positions.length + columns.departments.length > 0 ||
    query !== "" ||
    quick != null

  return {
    rows,
    active,
    columns,
    setColumn: <K extends keyof ColumnFilters>(key: K, value: ColumnFilters[K]) =>
      setColumns((current) => ({ ...current, [key]: value })),
    quick,
    toggleQuick: (next: QuickFilter) =>
      setQuick((current) => (sameQuickFilter(current, next) ? null : next)),
    reset: () => {
      setColumns(NO_COLUMN_FILTERS)
      setQuick(null)
    },
  }
}
