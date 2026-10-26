"use client"

import { useSearchParams } from "next/navigation"
import { currentEmployee } from "@/lib/goals/directory"
import { currentPeriod, parsePeriod } from "@/lib/goals/period"
import { routes } from "@/lib/goals/routes"
import { CardWorkspace } from "./card-workspace"
import { EmployeeHeader } from "./employee-header"

/** Экран сотрудника: свои карты, акцептование, самооценка и создание карты */
export function MyCards() {
  const searchParams = useSearchParams()
  const employee = currentEmployee()
  const { year, quarter } = parsePeriod(searchParams.get("p") ?? "") ?? currentPeriod()

  return (
    <div className="flex flex-col gap-4">
      <EmployeeHeader employee={employee} />
      <CardWorkspace
        employee={employee}
        year={year}
        quarter={quarter}
        role="employee"
        creating={searchParams.get("new") === "1"}
        hrefFor={(y, q, create) => routes.myCards({ year: y, quarter: q }, create)}
        exitHref={routes.myCards()}
      />
    </div>
  )
}
