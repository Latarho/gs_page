"use client"

import Link from "next/link"
import { CheckIcon, GripIcon } from "lucide-react"
import type { Role } from "@/lib/goals/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NAV, type NavKey } from "./nav"
import { RoleMenuGroup } from "./role-switcher"

/** Меню «Все разделы»: на мобильных заменяет боковую навигацию */
export function AppMenu({ active, viewer }: { active: NavKey; viewer: Role }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Все разделы"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          />
        }
      >
        <GripIcon className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Разделы</DropdownMenuLabel>
          {NAV.map((item) => (
            <DropdownMenuItem
              key={item.key}
              disabled={!item.href}
              render={item.href ? <Link href={item.href} /> : undefined}
            >
              <item.icon />
              <span className="flex-1">{item.label}</span>
              {!item.href && <span className="text-xs text-muted-foreground">скоро</span>}
              {item.key === active && <CheckIcon className="text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <RoleMenuGroup viewer={viewer} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
