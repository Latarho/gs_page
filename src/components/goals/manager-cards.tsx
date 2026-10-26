"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ALL_EMPLOYEES_COUNT, employeesOf, MANAGERS } from "@/lib/goals/directory"
import { cardId, currentPeriod, formatPeriod, YEARS } from "@/lib/goals/period"
import { type CardStage, STAGE_ORDER, stageOf } from "@/lib/goals/status"
import { useCards } from "@/lib/goals/store"
import type { Employee } from "@/lib/goals/types"
import { awaitsAgreement, needsCreation } from "@/lib/goals/workflow"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeesTable } from "./employees-table"
import { ExpectedActions, FilteredCount, StageSummary } from "./list-summary"
import { type QuickFilter, useEmployeeFilters } from "./use-employee-filters"

/** Список сотрудников руководителя (делегата) с картами по кварталам */
export function ManagerCards() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const cards = useCards()

  // Руководитель, год и признак прямого подчинения живут в URL
  const managerId = searchParams.get("m") ?? MANAGERS[0].id
  const year = Number(searchParams.get("year") ?? currentPeriod().year)
  const directOnly = searchParams.get("all") !== "1"
  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (value == null) params.delete(key)
    else params.set(key, value)
    router.replace(`${pathname}?${params}`, { scroll: false })
  }

  const now = currentPeriod()
  // Сводка — по текущему кварталу, для прошлых лет — по последнему
  const summaryQuarter = year === now.year ? now.quarter : 4
  const stageIn = (e: Employee) => stageOf(cards[cardId(e.id, year, summaryQuarter)])
  const toCreate = (e: Employee) => needsCreation(e, cards, now, year)
  const toAgree = (e: Employee) => awaitsAgreement(e, cards, year)

  const employees = useMemo(
    () => employeesOf(managerId).filter((e) => !directOnly || e.direct),
    [managerId, directOnly]
  )

  const filters = useEmployeeFilters(employees, (e, quick: QuickFilter) =>
    quick.kind === "toCreate" ? toCreate(e) : quick.kind === "toAgree" ? toAgree(e) : stageIn(e) === quick.stage
  )

  const stageCounts = Object.fromEntries(STAGE_ORDER.map((s) => [s, 0])) as Record<CardStage, number>
  for (const e of employees) stageCounts[stageIn(e)]++

  return (
    <div className="flex flex-col gap-4">
      <Tabs value="delegate">
        <TabsList variant="line" className="h-auto p-0">
          <TabsTrigger value="delegate" className="px-1 pb-2 text-sm text-primary! after:bg-primary!">
            Делегат Руководителя <CountBadge value={ALL_EMPLOYEES_COUNT} />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={managerId} onValueChange={(value) => setParam("m", String(value))}>
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-x-4 border-b p-0 group-data-horizontal/tabs:h-auto"
        >
          {MANAGERS.map((manager) => (
            <TabsTrigger
              key={manager.id}
              value={manager.id}
              className="flex-none gap-2 px-1 pb-2 font-normal data-active:text-primary data-active:after:bg-primary"
            >
              <Avatar size="sm">
                <AvatarFallback className="text-[10px]">{manager.initials}</AvatarFallback>
              </Avatar>
              {manager.fullName}
              <CountBadge value={employeesOf(manager.id).length} />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Выберите год</span>
          <Select value={String(year)} onValueChange={(value) => setParam("year", String(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={directOnly}
            onCheckedChange={(checked) => setParam("all", checked ? null : "1")}
          />
          Сотрудники прямого подчинения
        </label>
      </div>

      <ExpectedActions
        quick={filters.quick}
        onToggle={filters.toggleQuick}
        items={[
          {
            filter: { kind: "toCreate" },
            period: formatPeriod(now.year, now.quarter),
            count: employees.filter(toCreate).length,
            tone: "text-destructive",
            label: "Необходимо создать КР для сотрудников прямого подчинения и отправить на акцептование",
          },
          {
            filter: { kind: "toAgree" },
            period: String(year),
            count: employees.filter(toAgree).length,
            tone: "text-primary",
            label: "Необходимо согласовать КР, созданные сотрудниками",
          },
        ]}
      />

      <StageSummary
        period={formatPeriod(year, summaryQuarter)}
        counts={stageCounts}
        quick={filters.quick}
        onToggle={filters.toggleQuick}
        aside={
          filters.active && (
            <FilteredCount shown={filters.rows.length} total={employees.length} onReset={filters.reset} />
          )
        }
      />

      <EmployeesTable
        employees={employees}
        rows={filters.rows}
        cards={cards}
        year={year}
        filters={filters.columns}
        onFilterChange={filters.setColumn}
        filtersActive={filters.active}
        onResetFilters={filters.reset}
        actionHint={(e) =>
          toAgree(e)
            ? "Ожидает согласования карты"
            : toCreate(e)
              ? `Нужно создать КР ${formatPeriod(now.year, now.quarter)}`
              : null
        }
      />
    </div>
  )
}

function CountBadge({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4.5 min-w-5 items-center justify-center rounded-full border border-destructive/60 px-1.5 text-[11px] leading-none font-medium text-destructive",
        className
      )}
    >
      {value}
    </span>
  )
}
