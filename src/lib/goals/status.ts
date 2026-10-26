import { formatPercent } from "@/lib/format"
import { cardScore } from "./card"
import type { PerformanceCard } from "./types"

/**
 * Стадия карты с точки зрения пользователя. Отличается от статуса тем,
 * что учитывает отсутствие карты и автора: карту руководителя акцептуют,
 * карту сотрудника — согласуют.
 */
export type CardStage = "none" | "draft" | "approval" | "agreement" | "active" | "assessed"

export function stageOf(card: PerformanceCard | undefined | null): CardStage {
  if (!card) return "none"
  if (card.status === "approval") return card.author === "employee" ? "agreement" : "approval"
  return card.status
}

interface StageMeta {
  /** Название в сводке и легенде */
  label: string
  /** Название на бейдже карты */
  badgeLabel: string
  /** Короткая подпись в ячейке периода */
  short: string
  hint: string
  /** Классы бейджа карты */
  badge: string
  /** Классы ячейки периода в списке */
  pill: string
  /** Цвет точки-индикатора */
  dot: string
}

/** Единая палитра и подписи стадий — ячейки, бейджи, вкладки и сводка согласованы */
export const STAGES: Record<CardStage, StageMeta> = {
  none: {
    label: "Не создана",
    badgeLabel: "Новая",
    short: "",
    hint: "Создать карту результативности",
    badge: "bg-info-soft text-primary",
    pill: "bg-muted text-primary hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_7%)]",
    dot: "bg-muted-foreground/30",
  },
  draft: {
    label: "Черновик",
    badgeLabel: "Черновик",
    short: "черновик",
    hint: "Продолжить заполнение черновика",
    badge: "bg-warning-soft text-warning",
    pill: "bg-warning-soft text-warning hover:brightness-95",
    dot: "bg-warning",
  },
  approval: {
    label: "На акцептовании",
    badgeLabel: "На акцептовании",
    short: "на акцепт.",
    hint: "Карта отправлена сотруднику на акцептование",
    badge: "bg-info-soft text-primary",
    pill: "bg-info-soft text-primary hover:brightness-95",
    dot: "bg-primary",
  },
  agreement: {
    label: "На согласовании",
    badgeLabel: "На согласовании",
    short: "на согласов.",
    hint: "Сотрудник отправил карту на согласование",
    badge: "bg-info-soft text-primary",
    pill: "bg-info-soft text-primary hover:brightness-95",
    dot: "bg-primary/50",
  },
  active: {
    label: "В работе",
    badgeLabel: "Активная",
    short: "в работе",
    hint: "Карта акцептована, идёт оценка",
    badge: "bg-success-soft text-success",
    pill: "bg-success-soft text-success hover:brightness-95",
    dot: "bg-success/60",
  },
  assessed: {
    label: "Оценена",
    badgeLabel: "Оценена",
    short: "",
    hint: "Оценка завершена",
    badge: "bg-muted text-muted-foreground",
    pill: "bg-success-soft text-success hover:brightness-95",
    dot: "bg-success",
  },
}

export const STAGE_ORDER: CardStage[] = ["none", "draft", "approval", "agreement", "active", "assessed"]

/** Подпись ячейки периода: «3Q2026 | черновик», «2Q2026 | 97.273%» */
export function periodLabel(period: string, card: PerformanceCard | undefined) {
  const stage = stageOf(card)
  if (!card) return period
  if (stage === "assessed") {
    const score = cardScore(card)
    return score == null ? period : `${period} | ${formatPercent(score)}`
  }
  const short = stage === "draft" && card.author === "employee" ? "черновик сотр." : STAGES[stage].short
  return `${period} | ${short}`
}

export function periodHint(card: PerformanceCard | undefined) {
  if (card?.status === "draft" && card.author === "employee") {
    return "Сотрудник заполняет карту самостоятельно"
  }
  return STAGES[stageOf(card)].hint
}
