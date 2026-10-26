"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckIcon, EllipsisIcon, FilePlus2Icon, UndoIcon } from "lucide-react"
import { toast } from "sonner"
import { formatDateTime, formatPercent } from "@/lib/format"
import { cardScore, findPreviousCard, newCardTemplate } from "@/lib/goals/card"
import { cardId, formatPeriod } from "@/lib/goals/period"
import { saveCard, useCards } from "@/lib/goals/store"
import type { Employee, PerformanceCard, Quarter, Role } from "@/lib/goals/types"
import { cardAccess, otherRole } from "@/lib/goals/workflow"
import { confirmLeave } from "@/lib/unsaved"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { CardEditor } from "./card-editor"
import { EmptyState, Notice, StatusBadge, Tag } from "./card-parts"
import { CardView } from "./card-view"
import { ConfirmDialog } from "./confirm-dialog"
import { PeriodNav } from "./period-nav"
import { ROLE_COPY } from "./role-copy"

/**
 * Рабочая область карты результативности: выбор периода, статус,
 * действия по согласованию и сама карта. Общая для экранов
 * руководителя и сотрудника — отличается ролью.
 */
export function CardWorkspace({
  employee,
  year,
  quarter,
  role,
  creating = false,
  hrefFor,
  exitHref,
}: {
  employee: Employee
  year: number
  quarter: Quarter
  role: Role
  /** Сотрудник явно начал создание карты */
  creating?: boolean
  hrefFor: (year: number, quarter: Quarter, create?: boolean) => string
  exitHref: string
}) {
  const router = useRouter()
  const cards = useCards()
  const copy = ROLE_COPY[role]
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnComment, setReturnComment] = useState("")

  const id = cardId(employee.id, year, quarter)
  const stored = cards[id]
  const period = formatPeriod(year, quarter)
  const { editing, shown, otherDraft } = cardAccess(stored, role, creating)

  const template = useMemo(
    () => newCardTemplate(employee, year, quarter, role),
    [employee, year, quarter, role]
  )

  const navigate = (y: number, q: Quarter, create = false) => {
    if (confirmLeave()) router.push(hrefFor(y, q, create))
  }

  /** Изменение сохранённой карты с возможностью отменить его из уведомления */
  const update = (patch: Partial<PerformanceCard>, message: string) => {
    if (!stored) return
    const before = stored
    saveCard({ ...stored, ...patch })
    toast.success(message, { action: { label: "Отменить", onClick: () => saveCard(before) } })
  }

  const sendBack = () => {
    const comment = returnComment.trim()
    if (!comment) return
    update(
      { status: "draft", lastReturn: { by: role, comment, at: new Date().toISOString() } },
      copy.returnDialog.done
    )
    setReturnOpen(false)
    setReturnComment("")
  }

  return (
    <div className="flex flex-col gap-4">
      <PeriodNav
        cards={cards}
        employeeId={employee.id}
        year={year}
        quarter={quarter}
        onNavigate={navigate}
      />

      <CardHeading
        card={shown}
        title={`${editing && !stored ? "Создание карты результативности" : "Карта результативности"} ${period}`}
        goalGroup={employee.goalGroup}
        actions={
          role === "manager" &&
          (shown?.status === "active" || shown?.status === "assessed") && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="secondary" size="icon-lg" aria-label="Действия с картой" />}
              >
                <EllipsisIcon className="text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {shown.status === "active" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      update({ status: "draft", author: "manager" }, "Карта возвращена в черновик")
                    }
                  >
                    Вернуть в черновик
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => update({ status: "active" }, "Карта возвращена на оценку")}>
                    Вернуть на оценку
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      />

      {shown?.status === "approval" &&
        (shown.author === role ? (
          <Notice
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => update({ status: "draft" }, "Карта отозвана в черновик")}
              >
                <UndoIcon /> Отозвать в черновик
              </Button>
            }
          >
            {copy.waiting}
          </Notice>
        ) : (
          <Notice
            tone="action"
            action={
              <>
                <Button variant="outline" size="sm" onClick={() => setReturnOpen(true)}>
                  <UndoIcon /> {copy.decide.returnLabel}
                </Button>
                <Button size="sm" onClick={() => update({ status: "active" }, copy.decide.accepted)}>
                  <CheckIcon /> {copy.decide.accept}
                </Button>
              </>
            }
          >
            {copy.decide.notice}
          </Notice>
        ))}

      <ConfirmDialog
        open={returnOpen}
        onOpenChange={setReturnOpen}
        title={copy.returnDialog.title}
        description={`Напишите, что нужно исправить — комментарий увидит ${copy.returnDialog.reader} при редактировании карты.`}
        confirmLabel="Вернуть"
        confirmDisabled={!returnComment.trim()}
        onConfirm={sendBack}
      >
        <Textarea
          autoFocus
          rows={3}
          value={returnComment}
          onChange={(e) => setReturnComment(e.target.value)}
          placeholder="Например: уточните ожидаемый результат по задаче 3 и перераспределите веса"
          aria-label="Комментарий"
        />
      </ConfirmDialog>

      {editing ? (
        <div className="rounded-xl border px-3 pb-3 sm:px-4">
          <CardEditor
            key={`${id}:edit`}
            initial={stored ?? template}
            isNew={!stored}
            previous={findPreviousCard(cards, employee.id, year, quarter)}
            role={role}
            exitHref={exitHref}
          />
        </div>
      ) : shown ? (
        <div className="rounded-xl border px-3 pb-3 sm:px-4">
          <CardView key={`${id}:${shown.status}`} card={shown} role={role} />
        </div>
      ) : otherDraft ? (
        <EmptyState>
          {ROLE_COPY[otherRole(role)].name} готовит карту результативности на {period}. Она появится
          здесь после отправки {copy.otherDraftWaitsFor}.
        </EmptyState>
      ) : (
        <EmptyState
          action={
            <Button nativeButton={false} render={<Link href={hrefFor(year, quarter, true)} />}>
              <FilePlus2Icon /> Создать карту
            </Button>
          }
        >
          Карта результативности на {period} ещё не создана. Руководитель может создать её для вас,
          или вы можете заполнить карту самостоятельно и отправить на согласование.
        </EmptyState>
      )}
    </div>
  )
}

/** Бейджи статуса, заголовок, дата изменения и итоговая оценка карты */
function CardHeading({
  card,
  title,
  goalGroup,
  actions,
}: {
  card: PerformanceCard | null
  title: string
  goalGroup: string
  actions?: ReactNode
}) {
  const score = card ? cardScore(card) : null
  const scored = card?.status === "active" || card?.status === "assessed"

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5">
          <StatusBadge card={card} />
          <Tag className="bg-muted text-foreground">{goalGroup}</Tag>
          {card?.author === "employee" && (
            <Tag className="bg-muted text-muted-foreground">Создана сотрудником</Tag>
          )}
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {card?.updatedAt && (
          <p className="text-xs text-muted-foreground">Изменена {formatDateTime(card.updatedAt)}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {scored && (
          <div className="flex h-10 items-center gap-4 rounded-lg bg-muted px-4 text-sm">
            Оценка результативности
            <span className="font-semibold">{score == null ? "—" : formatPercent(score)}</span>
          </div>
        )}
        {actions}
      </div>
    </div>
  )
}
