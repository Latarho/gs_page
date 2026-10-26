import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/format"

/** Вес раздела рядом с его заголовком */
export function Subtotal({ value }: { value: number }) {
  return (
    <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium tracking-normal text-muted-foreground normal-case tabular-nums">
      {value}%
    </span>
  )
}

/** Распределение весов КПЭ и ЗРД относительно 100% и состояние сохранения */
export function WeightSummary({
  kpi,
  tasks,
  dirty,
  savedAt,
}: {
  kpi: number
  tasks: number
  dirty: boolean
  savedAt: Date | null
}) {
  const total = kpi + tasks
  return (
    <div className="flex min-w-64 flex-1 flex-col gap-1.5">
      <WeightBar kpi={kpi} tasks={tasks} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Суммарный вес:{" "}
          <span
            className={cn(
              "font-semibold tabular-nums",
              total === 100 ? "text-success" : "text-destructive"
            )}
          >
            {total}%
          </span>{" "}
          из 100%
          {total !== 100 && (
            <span className="text-destructive">
              {" "}
              · {total < 100 ? `осталось распределить ${100 - total}%` : `превышение на ${total - 100}%`}
            </span>
          )}
        </span>
        <span aria-live="polite" className="inline-flex items-center gap-1">
          {dirty ? (
            <>
              <span className="size-1.5 rounded-full bg-warning" /> Есть несохранённые изменения
            </>
          ) : savedAt ? (
            <>
              <CheckIcon className="size-3 text-success" /> Сохранено в {formatTime(savedAt)}
            </>
          ) : null}
        </span>
      </div>
    </div>
  )
}

function WeightBar({ kpi, tasks }: { kpi: number; tasks: number }) {
  const total = kpi + tasks
  const scale = Math.max(total, 100)
  const width = (value: number) => `${(value / scale) * 100}%`
  return (
    <div
      className="relative flex h-2 overflow-hidden rounded-full bg-muted"
      role="meter"
      aria-label="Суммарный вес"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={total}
    >
      <div className="h-full bg-primary transition-[width]" style={{ width: width(kpi) }} title={`КПЭ: ${kpi}%`} />
      <div
        className={cn("h-full transition-[width]", total > 100 ? "bg-destructive" : "bg-primary/45")}
        style={{ width: width(tasks) }}
        title={`ЗРД: ${tasks}%`}
      />
      {total > 100 && (
        <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: width(100) }} />
      )}
    </div>
  )
}
