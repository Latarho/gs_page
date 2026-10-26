import Link from "next/link"
import { Fragment, type ReactNode } from "react"
import {
  AudioLinesIcon,
  CircleHelpIcon,
  HomeIcon,
  ListIndentIncreaseIcon,
  ShieldIcon,
  WrenchIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AppMenu } from "./app-menu"
import { NAV, type NavKey } from "./nav"
import type { Role } from "@/lib/goals/types"
import { RoleSwitcher } from "./role-switcher"
import { ThemeToggle } from "./theme-toggle"

export interface Crumb {
  label: string
  href?: string
}

export function AppShell({
  title,
  crumbs,
  active = "goals",
  viewer = "manager",
  children,
}: {
  title: ReactNode
  crumbs: Crumb[]
  active?: NavKey
  viewer?: Role
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <TopBar crumbs={crumbs} active={active} viewer={viewer} />
      <div className="flex flex-1">
        <SideNav active={active} viewer={viewer} />
        <main className="min-w-0 flex-1 px-3 pb-6 sm:px-4 md:pr-6 md:pl-2">
          <h1 className="flex items-center gap-2 py-5 text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
            <CircleHelpIcon className="size-5 fill-primary text-white" aria-hidden />
          </h1>
          <div className="rounded-2xl bg-card p-4 shadow-xs sm:p-5">{children}</div>
        </main>
      </div>
    </div>
  )
}

function TopBar({ crumbs, active, viewer }: { crumbs: Crumb[]; active: NavKey; viewer: Role }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-3 sm:px-4">
      <Link href="/" className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <AudioLinesIcon className="size-5" />
        <span className="sr-only">На главную</span>
      </Link>
      <AppMenu active={active} viewer={viewer} />
      <div className="hidden h-6 w-px bg-border sm:block" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap text-xs sm:text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />} aria-label="Главная">
              <HomeIcon className="size-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb, i) => (
            <Fragment key={crumb.label}>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                {i === crumbs.length - 1 || !crumb.href ? (
                  <BreadcrumbPage
                    className={cn("truncate", i === crumbs.length - 1 && "text-primary")}
                  >
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />} className="truncate">
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-0.5 sm:gap-2">
        <ThemeToggle />
        <IconAction label="Справка">
          <CircleHelpIcon className="size-5 fill-primary text-white" />
        </IconAction>
        <IconAction label="Настройки" className="hidden sm:flex">
          <WrenchIcon className="size-5 fill-primary text-primary" />
        </IconAction>
        <IconAction label="О системе" className="hidden sm:flex">
          <ShieldIcon className="size-6 text-primary" />
        </IconAction>
      </div>
    </header>
  )
}

function IconAction({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className={cn("flex size-9 items-center justify-center rounded-full hover:bg-muted", className)}
            aria-label={label}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function SideNav({ active, viewer }: { active: NavKey; viewer: Role }) {
  return (
    <nav className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-16 shrink-0 flex-col items-center gap-2 py-3 md:flex">
      <RoleSwitcher viewer={viewer} />
      {NAV.map((item) => (
        <Tooltip key={item.key}>
          <TooltipTrigger
            render={
              item.href ? (
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={item.key === active ? "page" : undefined}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
                    item.key === active && "bg-card text-primary shadow-xs"
                  )}
                />
              ) : (
                <span
                  tabIndex={0}
                  aria-label={`${item.label} — скоро`}
                  aria-disabled
                  className="flex size-10 cursor-default items-center justify-center rounded-xl text-muted-foreground/50"
                />
              )
            }
          >
            <item.icon className="size-5" />
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.label}
            {!item.href && " — скоро"}
          </TooltipContent>
        </Tooltip>
      ))}
      <div className="my-2 h-px w-8 bg-border" />
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Развернуть меню"
              className="flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-card"
            />
          }
        >
          <ListIndentIncreaseIcon className="size-5" />
        </TooltipTrigger>
        <TooltipContent side="right">Развернуть меню</TooltipContent>
      </Tooltip>
    </nav>
  )
}
