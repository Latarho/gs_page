"use client"

/**
 * Флаг несохранённых изменений в редакторе карты. Навигация внутри
 * приложения спрашивает подтверждение через confirmLeave().
 */
let unsaved = false

export function setUnsaved(value: boolean) {
  unsaved = value
}

export function confirmLeave() {
  return !unsaved || window.confirm("Есть несохранённые изменения. Уйти без сохранения?")
}
