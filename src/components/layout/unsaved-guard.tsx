"use client"

import { useEffect } from "react"
import { confirmLeave } from "@/lib/unsaved"

/**
 * Перехватывает переходы по внутренним ссылкам, пока в редакторе есть
 * несохранённые изменения. Закрытие вкладки обрабатывает beforeunload в редакторе.
 */
export function UnsavedGuard() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const link = (e.target as Element | null)?.closest("a[href]")
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank") return
      if (link.origin !== window.location.origin) return
      if (!confirmLeave()) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])
  return null
}
