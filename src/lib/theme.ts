"use client"

import { useSyncExternalStore } from "react"

/**
 * Светлая/тёмная тема: класс `dark` на <html> и выбор в localStorage.
 * Начальный класс ставит скрипт THEME_INIT_SCRIPT до гидратации.
 */
export type Theme = "light" | "dark"

const STORAGE_KEY = "gs:theme"

export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

const getTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light"

export function useTheme() {
  return useSyncExternalStore<Theme>(subscribe, getTheme, () => "light")
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // хранилище недоступно — тема действует до перезагрузки
  }
}
