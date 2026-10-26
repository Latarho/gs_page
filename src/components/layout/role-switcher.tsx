"use client"

import Link from "next/link"
import { CheckIcon } from "lucide-react"
import { DEMO_USERS } from "@/lib/goals/directory"
import { routes } from "@/lib/goals/routes"
import type { Role } from "@/lib/goals/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const HOME: Record<Role, string> = {
  manager: routes.managerList(),
  employee: routes.myCards(),
}

/** Пункты меню «Войти как (демо)» — общие для аватара и меню разделов */
export function RoleMenuGroup({ viewer }: { viewer: Role }) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Войти как (демо)</DropdownMenuLabel>
      {(Object.keys(DEMO_USERS) as Role[]).map((role) => (
        <DropdownMenuItem key={role} render={<Link href={HOME[role]} />}>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate">{DEMO_USERS[role].name}</span>
            <span className="text-xs text-muted-foreground">{DEMO_USERS[role].title}</span>
          </div>
          {role === viewer && <CheckIcon className="text-primary" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  )
}

/** Аватар текущего пользователя с демо-переключением роли */
export function RoleSwitcher({ viewer }: { viewer: Role }) {
  const current = DEMO_USERS[viewer]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Пользователь: ${current.name}. Сменить роль`}
            className="mb-3 rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        }
      >
        <Avatar className="size-10 rounded-lg after:rounded-lg">
          <AvatarFallback className="rounded-lg bg-primary/15 font-semibold text-primary">
            {current.initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-72">
        <RoleMenuGroup viewer={viewer} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
