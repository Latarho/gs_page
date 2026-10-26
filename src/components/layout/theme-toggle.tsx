"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { setTheme, useTheme } from "@/lib/theme"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const theme = useTheme()
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="Переключить тему"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-9 items-center justify-center rounded-full text-primary hover:bg-muted"
          />
        }
      >
        {/* Иконка выбирается CSS-классом, чтобы не было расхождения при гидратации */}
        <MoonIcon className="size-5 dark:hidden" />
        <SunIcon className="hidden size-5 dark:block" />
      </TooltipTrigger>
      <TooltipContent>Светлая / тёмная тема</TooltipContent>
    </Tooltip>
  )
}
