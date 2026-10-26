import { Suspense } from "react"
import type { Metadata } from "next"
import { routes } from "@/lib/goals/routes"
import { AppShell } from "@/components/layout/app-shell"
import { MyCards } from "@/components/goals/my-cards"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Мои карты результативности" }

export default function MyCardsPage() {
  return (
    <AppShell
      title="Целеполагание и оценка результативности"
      crumbs={[
        { label: "Целеполагание", href: routes.myCards() },
        { label: "Мои карты результативности" },
      ]}
      active="my"
      viewer="employee"
    >
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <MyCards />
      </Suspense>
    </AppShell>
  )
}
