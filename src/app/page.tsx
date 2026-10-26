import { redirect } from "next/navigation"
import { routes } from "@/lib/goals/routes"

export default function Home() {
  redirect(routes.managerList())
}
