"use client"

import { useSyncExternalStore } from "react"
import { SEED_CARDS } from "./mock-data"
import type { CardsById, PerformanceCard } from "./types"

/**
 * Хранилище карт результативности на клиенте.
 * Пока нет бэкенда: исходные данные — мок, изменения сохраняются в localStorage.
 */

const STORAGE_KEY = "gs:performance-cards:v1"

let cards: CardsById = SEED_CARDS
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as CardsById
      // Карты, сохранённые до появления поля author, создавал руководитель
      for (const card of Object.values(saved)) card.author ??= "manager"
      cards = { ...SEED_CARDS, ...saved }
    }
  } catch {
    // повреждённые данные или недоступное хранилище — работаем с моком
  }
}

function persist() {
  try {
    // Сохраняем только отличающиеся от мока карты
    const changed = Object.fromEntries(
      Object.entries(cards).filter(([id, card]) => SEED_CARDS[id] !== card)
    )
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(changed))
  } catch {
    // хранилище недоступно — изменения живут до перезагрузки
  }
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  load()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return cards
}

export function useCards(): CardsById {
  return useSyncExternalStore(subscribe, getSnapshot, () => SEED_CARDS)
}

export function saveCard(card: PerformanceCard) {
  cards = { ...cards, [card.id]: { ...card, updatedAt: new Date().toISOString() } }
  emit()
}

export function deleteCard(id: string) {
  const rest = { ...cards }
  delete rest[id]
  cards = rest
  emit()
}
