"use client"

import { PlusIcon } from "lucide-react"
import { cardId, formatPeriod, QUARTERS, YEARS } from "@/lib/goals/period"
import { STAGES, stageOf } from "@/lib/goals/status"
import type { CardsById, Quarter } from "@/lib/goals/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Год, вкладки кварталов с картами и меню создания карты
 * на свободный квартал. Переходы выполняет onNavigate.
 */
export function PeriodNav({
  cards,
  employeeId,
  year,
  quarter,
  onNavigate,
}: {
  cards: CardsById
  employeeId: string
  year: number
  quarter: Quarter
  onNavigate: (year: number, quarter: Quarter, create?: boolean) => void
}) {
  const cardOf = (y: number, q: Quarter) => cards[cardId(employeeId, y, q)]
  const tabs = QUARTERS.filter((q) => q === quarter || cardOf(year, q))
  const freeQuarters = QUARTERS.filter((q) => q !== quarter && !cardOf(year, q))

  const changeYear = (y: number) => onNavigate(y, QUARTERS.find((q) => cardOf(y, q)) ?? 1)

  return (
    <div className="flex flex-wrap items-center gap-4 border-b">
      <Select value={String(year)} onValueChange={(v) => changeYear(Number(v))}>
        <SelectTrigger className="mb-2 w-32" aria-label="Год">
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

      <Tabs value={quarter} onValueChange={(q) => onNavigate(year, q as Quarter)}>
        <TabsList variant="line" className="h-auto flex-wrap justify-start gap-x-4 p-0 group-data-horizontal/tabs:h-auto">
          {tabs.map((q) => {
            const card = cardOf(year, q)
            return (
              <TabsTrigger
                key={q}
                value={q}
                className="flex-none px-1 pb-2.5 font-normal data-active:text-primary data-active:after:bg-primary"
              >
                {card && (
                  <span className={`size-1.5 rounded-full ${STAGES[stageOf(card)].dot}`} aria-hidden />
                )}
                КР {formatPeriod(year, q)}
                {!card && <span className="rounded bg-info-soft px-1 text-[10px] text-primary">новая</span>}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {freeQuarters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="mb-2 text-primary" />}>
            <PlusIcon /> Новая КР
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {freeQuarters.map((q) => (
              <DropdownMenuItem key={q} onClick={() => onNavigate(year, q, true)}>
                КР {formatPeriod(year, q)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
