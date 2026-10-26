"use client"

import type { ReactNode } from "react"
import { cardId, QUARTERS } from "@/lib/goals/period"
import type { CardsById, Employee } from "@/lib/goals/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColumnSearchFilter, ColumnValuesFilter } from "./column-filter"
import { PeriodPill } from "./period-pill"
import type { ColumnFilters } from "./use-employee-filters"

const distinct = (values: string[]) =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "ru"))

/** Сотрудники руководителя с фильтрами в заголовках и картами по кварталам */
export function EmployeesTable({
  employees,
  rows,
  cards,
  year,
  filters,
  onFilterChange,
  filtersActive,
  onResetFilters,
  actionHint,
}: {
  /** Все сотрудники — источник значений для фильтров */
  employees: Employee[]
  /** Сотрудники после фильтрации */
  rows: Employee[]
  cards: CardsById
  year: number
  filters: ColumnFilters
  onFilterChange: <K extends keyof ColumnFilters>(key: K, value: ColumnFilters[K]) => void
  filtersActive: boolean
  onResetFilters: () => void
  /** Подсказка о требуемом действии по сотруднику; null — действий нет */
  actionHint: (employee: Employee) => string | null
}) {
  return (
    <div className="overflow-hidden rounded-lg">
      <Table className="min-w-[1180px] table-fixed text-[13px]">
        <colgroup>
          <col className="w-[140px]" />
          <col className="w-[200px]" />
          <col className="w-[190px]" />
          <col className="w-[330px]" />
          <col />
        </colgroup>
        <TableHeader className="bg-table-head">
          <TableRow className="hover:bg-transparent">
            <HeadCell label="Группа целеполагания">
              <ColumnValuesFilter
                label="Группа целеполагания"
                options={distinct(employees.map((e) => e.goalGroup))}
                selected={filters.groups}
                onChange={(v) => onFilterChange("groups", v)}
              />
            </HeadCell>
            <HeadCell label="ФИО">
              <ColumnSearchFilter label="ФИО" value={filters.name} onChange={(v) => onFilterChange("name", v)} />
            </HeadCell>
            <HeadCell label="Должность">
              <ColumnValuesFilter
                label="Должность"
                options={distinct(employees.map((e) => e.position))}
                selected={filters.positions}
                onChange={(v) => onFilterChange("positions", v)}
              />
            </HeadCell>
            <HeadCell label="Подразделение">
              <ColumnValuesFilter
                label="Подразделение"
                options={distinct(employees.map((e) => e.department))}
                selected={filters.departments}
                onChange={(v) => onFilterChange("departments", v)}
              />
            </HeadCell>
            <TableHead className="font-semibold">Карты результативности, периоды</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="py-3 whitespace-normal">{employee.goalGroup}</TableCell>
              <TableCell className="py-3 whitespace-normal">
                <EmployeeName employee={employee} actionHint={actionHint(employee)} />
              </TableCell>
              <TableCell className="py-3 whitespace-normal">{employee.position}</TableCell>
              <TableCell className="py-3 leading-snug whitespace-normal">{employee.department}</TableCell>
              <TableCell className="py-3">
                <div className="flex gap-1.5">
                  {QUARTERS.map((q) => (
                    <PeriodPill
                      key={q}
                      employeeId={employee.id}
                      year={year}
                      quarter={q}
                      card={cards[cardId(employee.id, year, q)]}
                    />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                Сотрудники не найдены.{" "}
                {filtersActive && (
                  <Button variant="link" className="h-auto p-0" onClick={onResetFilters}>
                    Сбросить фильтры
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

/** ФИО с отметкой о требуемом действии и признаком непрямого подчинения */
function EmployeeName({ employee, actionHint }: { employee: Employee; actionHint: string | null }) {
  return (
    <span className="relative inline-flex flex-wrap items-center gap-1.5">
      {employee.fullName}
      {actionHint && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                tabIndex={0}
                aria-label="Требуется действие"
                className="absolute top-1.5 -left-2.5 size-1.5 rounded-full bg-destructive"
              />
            }
          />
          <TooltipContent>{actionHint}</TooltipContent>
        </Tooltip>
      )}
      {!employee.direct && (
        <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">непрямое</span>
      )}
    </span>
  )
}

function HeadCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TableHead className="border-r border-background font-semibold">
      <div className="flex items-center justify-between gap-1">
        <span className="truncate">{label}</span>
        {children}
      </div>
    </TableHead>
  )
}
