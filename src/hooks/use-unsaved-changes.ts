"use client"

import { useEffect, useState } from "react"
import { setUnsaved } from "@/lib/unsaved"

/**
 * Отслеживает несохранённые изменения значения: сравнивает с последним
 * сохранённым снимком, предупреждает при закрытии вкладки и при переходах
 * внутри приложения (через UnsavedGuard и confirmLeave).
 */
export function useUnsavedChanges(value: unknown) {
  const snapshot = JSON.stringify(value)
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot)
  const dirty = snapshot !== savedSnapshot

  useEffect(() => {
    setUnsaved(dirty)
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  useEffect(() => () => setUnsaved(false), [])

  return {
    dirty,
    /** Текущее значение сохранено */
    markSaved: () => setSavedSnapshot(snapshot),
    /** Снять защиту перед уходом со страницы после сохранения */
    release: () => setUnsaved(false),
  }
}
