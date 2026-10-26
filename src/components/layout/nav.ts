import {
  FileTextIcon,
  GraduationCapIcon,
  PresentationIcon,
  TargetIcon,
  TrendingUpIcon,
  UserCogIcon,
} from "lucide-react"
import { routes } from "@/lib/goals/routes"

export type NavKey = "docs" | "reports" | "learning" | "goals" | "my" | "staff"

/** Разделы портала; href = null — раздел ещё не реализован */
export const NAV: Array<{ key: NavKey; label: string; href: string | null; icon: typeof FileTextIcon }> = [
  { key: "docs", label: "Документы", href: null, icon: FileTextIcon },
  { key: "reports", label: "Отчёты", href: null, icon: PresentationIcon },
  { key: "learning", label: "Обучение", href: null, icon: GraduationCapIcon },
  { key: "goals", label: "Карты результативности сотрудников", href: routes.managerList(), icon: TrendingUpIcon },
  { key: "my", label: "Мои карты результативности", href: routes.myCards(), icon: TargetIcon },
  { key: "staff", label: "Сотрудники", href: null, icon: UserCogIcon },
]
