import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { initials } from "@/lib/format"
import { getManager } from "@/lib/goals/directory"
import type { Employee } from "@/lib/goals/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

/** Сотрудник, его должность и руководитель; со ссылкой «назад», если она передана */
export function EmployeeHeader({ employee, backHref }: { employee: Employee; backHref?: string }) {
  const manager = getManager(employee.managerId)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {backHref && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="К списку сотрудников"
            nativeButton={false}
            render={<Link href={backHref} />}
          >
            <ArrowLeftIcon />
          </Button>
        )}
        <Avatar size="lg">
          <AvatarFallback>{initials(employee.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-semibold">{employee.fullName}</div>
          <div className="truncate text-xs text-muted-foreground">
            {employee.position} · {employee.department}
          </div>
        </div>
      </div>
      {manager && (
        <div className="text-xs text-muted-foreground">
          Руководитель: <span className="text-foreground">{manager.fullName}</span>
        </div>
      )}
    </div>
  )
}
