"use client"

import type { ReactNode } from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { type CardStage, STAGE_ORDER, STAGES } from "@/lib/goals/status"
import { Button } from "@/components/ui/button"
import { type QuickFilter, sameQuickFilter } from "./use-employee-filters"

/** «Ожидаемые действия»: строки кликабельны и включают быстрый фильтр */
export function ExpectedActions({
  items,
  quick,
  onToggle,
}: {
  items: Array<{ filter: QuickFilter; period: string; count: number; tone: string; label: string }>
  quick: QuickFilter | null
  onToggle: (filter: QuickFilter) => void
}) {
  const visible = items.filter((item) => item.count > 0)
  if (visible.length === 0) return null

  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1 text-xs">
      <span className="text-muted-foreground">Ожидаемые действия:</span>
      <div className="flex flex-col gap-1">
        {visible.map((item) => {
          const active = sameQuickFilter(quick, item.filter)
          return (
            <p key={item.filter.kind} className="flex flex-wrap items-center gap-x-3">
              <span>{item.period}</span>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(item.filter)}
                title={active ? "Показать всех сотрудников" : "Показать только этих сотрудников"}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-1 text-left font-semibold uppercase underline-offset-2 hover:underline",
                  active && "bg-muted underline",
                  item.tone
                )}
              >
                {item.label}
                <span className="font-bold">{item.count}</span>
              </button>
            </p>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Сводка стадий карт за период — одновременно легенда цветов
 * и быстрый фильтр по стадии.
 */
export function StageSummary({
  period,
  counts,
  quick,
  onToggle,
  aside,
}: {
  period: string
  counts: Record<CardStage, number>
  quick: QuickFilter | null
  onToggle: (filter: QuickFilter) => void
  aside?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="mr-1 text-muted-foreground">Статусы КР {period}:</span>
      {STAGE_ORDER.map((stage) => {
        const filter: QuickFilter = { kind: "stage", stage }
        const active = sameQuickFilter(quick, filter)
        return (
          <button
            key={stage}
            type="button"
            disabled={counts[stage] === 0 && !active}
            aria-pressed={active}
            onClick={() => onToggle(filter)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 transition-colors hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent",
              active && "border-primary bg-info-soft text-primary hover:bg-info-soft"
            )}
          >
            <span className={cn("size-2 rounded-full", STAGES[stage].dot)} aria-hidden />
            {STAGES[stage].label}
            <span className="font-semibold tabular-nums">{counts[stage]}</span>
          </button>
        )
      })}
      {aside}
    </div>
  )
}

export function FilteredCount({ shown, total, onReset }: { shown: number; total: number; onReset: () => void }) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="text-muted-foreground">
        Показано {shown} из {total}
      </span>
      <Button variant="ghost" size="sm" onClick={onReset}>
        <XIcon /> Сбросить фильтры
      </Button>
    </div>
  )
}
