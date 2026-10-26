"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { getEmployee } from "@/lib/goals/directory"
import { parsePeriod } from "@/lib/goals/period"
import { routes } from "@/lib/goals/routes"
import { Button } from "@/components/ui/button"
import { CardWorkspace } from "./card-workspace"
import { EmployeeHeader } from "./employee-header"

/** Карта сотрудника глазами руководителя */
export function PerformanceCardPage({ employeeId, period }: { employeeId: string; period: string }) {
  const employee = getEmployee(employeeId)
  const parsed = parsePeriod(period)

  if (!employee || !parsed) {
    return (
      <div className="flex flex-col items-start gap-3 py-10">
        <p className="text-muted-foreground">Карта результативности не найдена.</p>
        <Button variant="outline" nativeButton={false} render={<Link href={routes.managerList()} />}>
          <ArrowLeftIcon /> К списку сотрудников
        </Button>
      </div>
    )
  }

  const listHref = routes.managerList({ managerId: employee.managerId, year: parsed.year })

  return (
    <div className="flex flex-col gap-4">
      <EmployeeHeader employee={employee} backHref={listHref} />
      <CardWorkspace
        employee={employee}
        year={parsed.year}
        quarter={parsed.quarter}
        role="manager"
        hrefFor={(y, q) => routes.managerCard(employee.id, y, q)}
        exitHref={listHref}
      />
    </div>
  )
}
