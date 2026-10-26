"use client"

import { CircleHelpIcon, PlusIcon, TriangleAlertIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SmartCheck } from "@/lib/goals/smart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Буквы S · M · T: зелёная — критерий выполнен; strict — красим невыполненные в цвет ошибки */
export function SmartBadges({ checks, strict = false }: { checks: SmartCheck[]; strict?: boolean }) {
  const passed = checks.filter((c) => c.passed).length
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            tabIndex={0}
            role="img"
            aria-label={`SMART: выполнено ${passed} из ${checks.length}`}
            className="inline-flex gap-0.5 rounded focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        }
      >
        {checks.map((c) => (
          <span
            key={c.letter}
            className={cn(
              "flex size-5 items-center justify-center rounded text-[11px] font-bold",
              c.passed
                ? "bg-success-soft text-success"
                : strict
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning-soft text-warning"
            )}
          >
            {c.letter}
          </span>
        ))}
      </TooltipTrigger>
      <TooltipContent className="max-w-72">
        <ul className="flex flex-col gap-1">
          {checks.map((c) => (
            <li key={c.letter}>
              <span className="font-semibold">
                {c.letter} · {c.label}:
              </span>{" "}
              {c.passed ? "да" : c.hint}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}

/** Подсказки по невыполненным критериям; для срока — быстрое исправление */
export function SmartHints({
  checks,
  strict,
  deadline,
  onAddDeadline,
}: {
  checks: SmartCheck[]
  strict: boolean
  /** Дата конца квартала для быстрого исправления срока */
  deadline: string
  onAddDeadline: () => void
}) {
  const failed = checks.filter((c) => !c.passed)
  if (failed.length === 0) return null
  return (
    <ul className={cn("mt-1.5 flex flex-col gap-1 text-xs", strict ? "text-destructive" : "text-warning")}>
      {failed.map((c) => (
        <li key={c.letter} className="flex items-start gap-1.5">
          <TriangleAlertIcon className="mt-0.5 size-3 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="font-semibold">{c.label}.</span> {c.hint}
            {c.letter === "T" && (
              <button
                type="button"
                onClick={onAddDeadline}
                className="ml-1 inline-flex items-center gap-0.5 rounded px-1 font-medium text-primary hover:bg-info-soft"
              >
                <PlusIcon className="size-3" /> до {deadline}
              </button>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Памятка: как сформулировать ЗРД по упрощённому SMART */
export function SmartHelp() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-normal tracking-normal text-primary normal-case hover:bg-info-soft"
          />
        }
      >
        <CircleHelpIcon className="size-3.5" /> Формулировка по КИС
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96 gap-3 text-sm">
        <p className="font-medium">Каждая ЗРД проверяется по трём критериям:</p>
        <dl className="flex flex-col gap-2">
          <div>
            <dt className="font-semibold">S · Конкретность</dt>
            <dd className="text-muted-foreground">
              Наименование начинается с глагола действия и называет объект, без размытых слов вроде
              «способствовать» или «по возможности».
            </dd>
          </div>
          <div>
            <dt className="font-semibold">M · Измеримость</dt>
            <dd className="text-muted-foreground">
              В ожидаемом результате есть число, процент, количество или порог: «не менее 95%», «3
              модуля», «без замечаний».
            </dd>
          </div>
          <div>
            <dt className="font-semibold">T · Срок</dt>
            <dd className="text-muted-foreground">
              Указана дата или период: «до 15.12.2026», «до конца квартала», «ежемесячно».
            </dd>
          </div>
        </dl>
        <div className="rounded-md bg-muted p-2.5 text-xs">
          <div className="font-semibold">Пример</div>
          <div>Внедрить модуль «ЕСИА. Цифровой профиль» в промышленную эксплуатацию</div>
          <div className="text-muted-foreground">
            → Доля успешных запросов не менее 99% до 31.12.2026
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Достижимость и актуальность задачи оценивает согласующий. Отправить карту можно, когда все
          ЗРД проходят проверку.
        </p>
      </PopoverContent>
    </Popover>
  )
}
