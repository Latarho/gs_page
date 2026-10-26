import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { formatOptionalPercent } from "@/lib/format"
import type { DevTask } from "@/lib/goals/types"

/** Блок одной ЗРД в виде формы: номер, заголовок, действия справа и поля */
export function TaskBlock({
  number,
  title,
  aside,
  children,
}: {
  number: number
  title: ReactNode
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section aria-label={`ЗРД ${number}`} className="rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <h4 className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold">
          <span className="text-muted-foreground">№{number}</span>
          {title}
        </h4>
        {aside && <div className="flex items-center gap-2">{aside}</div>}
      </div>
      {/* Широкая колонка для текста, узкая — для процентов */}
      <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">{children}</div>
    </section>
  )
}

/** Поле формы с подписью */
export function FormField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

/** ЗРД оценённой карты в виде формы только для чтения */
export function TaskFormList({ tasks, numberFrom }: { tasks: DevTask[]; numberFrom: number }) {
  if (tasks.length === 0) {
    return <p className="px-1 py-6 text-center text-sm text-muted-foreground">Задачи не установлены</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((t, i) => (
        <TaskBlock
          key={t.id}
          number={numberFrom + i}
          title={t.name}
          aside={
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
              Вес {t.weight ?? 0}%
            </span>
          }
        >
          <ReadOnlyField label="Ожидаемый результат" className="sm:col-span-2">
            {t.expectedResult}
          </ReadOnlyField>
          <ReadOnlyField label="Достигнутый результат (самооценка)">{t.selfResult}</ReadOnlyField>
          <ReadOnlyField label="Самооценка, %" align="right">
            {formatOptionalPercent(t.selfScore)}
          </ReadOnlyField>
          <ReadOnlyField label="Выполнение (оценка руководителя)">{t.managerResult}</ReadOnlyField>
          <ReadOnlyField label="Оценка руководителя, %" align="right" emphasis>
            {formatOptionalPercent(t.managerScore)}
          </ReadOnlyField>
        </TaskBlock>
      ))}
    </div>
  )
}

/** Значение в рамке поля ввода, без возможности редактирования */
function ReadOnlyField({
  label,
  children,
  className,
  align = "left",
  emphasis = false,
}: {
  label: string
  children: ReactNode
  className?: string
  align?: "left" | "right"
  emphasis?: boolean
}) {
  const empty = children == null || children === ""
  return (
    <FormField label={label} className={className}>
      <div
        className={cn(
          "min-h-9 rounded-md border border-input bg-muted/40 px-3 py-2 text-[13px] whitespace-pre-line",
          align === "right" && "text-right tabular-nums",
          emphasis && !empty && "font-semibold",
          empty && "text-muted-foreground"
        )}
      >
        {empty ? "—" : children}
      </div>
    </FormField>
  )
}
