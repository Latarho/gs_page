import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatPeriod } from "@/lib/goals/period"
import { routes } from "@/lib/goals/routes"
import { periodHint, periodLabel, STAGES, stageOf } from "@/lib/goals/status"
import type { PerformanceCard, Quarter } from "@/lib/goals/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Ячейка квартала в списке сотрудников: статус карты и переход к ней */
export function PeriodPill({
  employeeId,
  year,
  quarter,
  card,
}: {
  employeeId: string
  year: number
  quarter: Quarter
  card?: PerformanceCard
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={routes.managerCard(employeeId, year, quarter)}
            className={cn(
              "flex h-7 min-w-28 flex-1 items-center justify-center rounded-md px-2 text-xs font-medium whitespace-nowrap transition-[filter,background-color] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              STAGES[stageOf(card)].pill
            )}
          />
        }
      >
        {periodLabel(formatPeriod(year, quarter), card)}
      </TooltipTrigger>
      <TooltipContent>{periodHint(card)}</TooltipContent>
    </Tooltip>
  )
}
