import { Suspense } from "react"
import type { Metadata } from "next"
import { routes } from "@/lib/goals/routes"
import { AppShell } from "@/components/layout/app-shell"
import { PerformanceCardPage } from "@/components/goals/card-page"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Карта результативности" }

export default function CardPage({ params }: PageProps<"/goals/cards/[employeeId]/[period]">) {
  return (
    <AppShell
      title="Целеполагание и оценка результативности"
      crumbs={[
        { label: "Целеполагание", href: routes.managerList() },
        { label: "Карты результативности", href: routes.managerList() },
        { label: "Карта результативности" },
      ]}
    >
      <Suspense fallback={<CardSkeleton />}>
        {params.then(({ employeeId, period }) => (
          <PerformanceCardPage employeeId={employeeId} period={period} />
        ))}
      </Suspense>
    </AppShell>
  )
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-7 w-72" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
