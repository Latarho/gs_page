"use client"

import { useEffect, useRef } from "react"

/** Ctrl+S / Cmd+S вызывает onSave вместо сохранения страницы браузером */
export function useSaveShortcut(onSave: () => void) {
  const saveRef = useRef(onSave)
  useEffect(() => {
    saveRef.current = onSave
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        saveRef.current()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
}
