"use client"

import type { ComponentProps, ReactNode } from "react"
import { ClockIcon, FilePlus2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { STAGES, stageOf } from "@/lib/goals/status"
import type { PerformanceCard } from "@/lib/goals/types"
import { Input } from "@/components/ui/input"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"

/** Визуальные элементы карты, общие для редактора, просмотра и рабочей области */

export function Tag({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded px-1.5 text-[11px] font-semibold tracking-wide uppercase",
        className
      )}
    >
      {children}
    </span>
  )
}

/** Статус карты; null — карта ещё не создана */
export function StatusBadge({ card }: { card: PerformanceCard | null }) {
  const stage = STAGES[stageOf(card)]
  return <Tag className={stage.badge}>{stage.badgeLabel}</Tag>
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 pt-4 pb-2">
      <h3 className="text-[13px] font-semibold tracking-wide uppercase">{children}</h3>
      {aside}
    </div>
  )
}

export function Th({ className, ...props }: ComponentProps<typeof TableHead>) {
  return <TableHead className={cn("font-semibold whitespace-normal", className)} {...props} />
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-6 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  )
}

/** Числовое поле в процентах (0–100); пустая строка — null */
export function PercentInput({
  value,
  onChange,
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <div className={cn("relative", className)}>
      <Input
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        step="any"
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            e.target.value === "" ? null : Math.min(100, Math.max(0, Number(e.target.value)))
          )
        }
        className="pr-6 text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        {...props}
      />
      <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
        %
      </span>
    </div>
  )
}

/** Панель действий, прилипающая к низу экрана внутри карточки страницы */
export function StickyFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap items-center gap-2 border-t bg-card px-4 pt-3 pb-1 sm:-mx-5 sm:px-5",
        className
      )}
    >
      {children}
    </div>
  )
}

export function Notice({
  children,
  action,
  tone = "info",
}: {
  children: ReactNode
  action?: ReactNode
  tone?: "info" | "action"
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg bg-info-soft px-3 py-2.5 text-sm",
        tone === "info" ? "text-primary" : "border border-primary/30"
      )}
    >
      <ClockIcon className="size-4 shrink-0 text-primary" />
      <span className="min-w-60 flex-1">{children}</span>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-14 text-center">
      <FilePlus2Icon className="size-10 text-muted-foreground/60" />
      <p className="max-w-lg text-sm text-muted-foreground">{children}</p>
      {action}
    </div>
  )
}
