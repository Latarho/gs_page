import { Suspense } from "react"
import type { Metadata } from "next"
import { routes } from "@/lib/goals/routes"
import { AppShell } from "@/components/layout/app-shell"
import { ManagerCards } from "@/components/goals/manager-cards"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Карты результативности" }

export default function CardsPage() {
  return (
    <AppShell
      title="Карты результативности"
      crumbs={[{ label: "Целеполагание", href: routes.managerList() }, { label: "Карты результативности" }]}
    >
      <Suspense fallback={<ListSkeleton />}>
        <ManagerCards />
      </Suspense>
    </AppShell>
  )
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-96" />
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
