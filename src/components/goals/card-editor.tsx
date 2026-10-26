"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CopyIcon,
  MessageSquareWarningIcon,
  PlusIcon,
  SaveIcon,
  SendIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useSaveShortcut } from "@/hooks/use-save-shortcut"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import {
  copyIndicators,
  emptyKpi,
  emptyTask,
  patchById,
  totalWeight,
  validateIndicators,
} from "@/lib/goals/card"
import { KPI_ZONES } from "@/lib/goals/directory"
import { formatPeriod, quarterEndDate } from "@/lib/goals/period"
import { deleteCard, saveCard } from "@/lib/goals/store"
import type { CardStatus, DevTask, Kpi, PerformanceCard, Role } from "@/lib/goals/types"
import { returnNoteFor } from "@/lib/goals/workflow"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SectionTitle, StickyFooter } from "./card-parts"
import { ConfirmDialog } from "./confirm-dialog"
import { KpiEditTable } from "./kpi-edit-table"
import { ROLE_COPY } from "./role-copy"
import { SmartHelp } from "./smart-check"
import { TaskEditForm } from "./task-edit-form"
import { Subtotal, WeightSummary } from "./weight-summary"

/** Редактирование черновика карты и отправка другой стороне */
export function CardEditor({
  initial,
  isNew,
  previous,
  role,
  exitHref,
}: {
  initial: PerformanceCard
  isNew: boolean
  previous?: PerformanceCard
  role: Role
  /** Куда уйти после удаления черновика */
  exitHref: string
}) {
  const router = useRouter()
  const copy = ROLE_COPY[role]
  const [kpis, setKpis] = useState(initial.kpis)
  const [tasks, setTasks] = useState(initial.tasks)
  const [showErrors, setShowErrors] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  // Новая строка получает фокус сразу после добавления
  const [focusId, setFocusId] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const { dirty, markSaved, release } = useUnsavedChanges([kpis, tasks])

  const period = formatPeriod(initial.year, initial.quarter)
  const { errors, messages } = validateIndicators(kpis, tasks)
  const invalid = (key: string) => (showErrors && errors[key]) || undefined
  const returnNote = returnNoteFor(initial, role)

  const build = (status: CardStatus): PerformanceCard => ({
    ...initial,
    status,
    author: role,
    // Отправленная карта — замечания учтены
    lastReturn: status === "draft" ? initial.lastReturn : undefined,
    kpis,
    tasks,
  })

  const saveDraft = () => {
    saveCard(build("draft"))
    markSaved()
    setSavedAt(new Date())
    toast.success(`Черновик КР ${period} сохранён`)
  }
  useSaveShortcut(saveDraft)

  const addKpi = () => {
    const kpi = emptyKpi(initial.kpis[0]?.zone ?? KPI_ZONES[0])
    setKpis((list) => [...list, kpi])
    setFocusId(kpi.id)
  }

  const addTask = () => {
    const task = emptyTask()
    setTasks((list) => [...list, task])
    setFocusId(task.id)
  }

  const requestSend = () => {
    setShowErrors(true)
    if (messages.length > 0) {
      toast.error("Карту пока нельзя отправить", { description: messages.join(". ") })
      return
    }
    setSendOpen(true)
  }

  const send = () => {
    const draft = build("draft")
    release()
    saveCard(build("approval"))
    setSendOpen(false)
    toast.success(`КР ${period} ${copy.send.done}`, {
      action: { label: "Отменить", onClick: () => saveCard(draft) },
    })
  }

  const removeDraft = () => {
    const draft = build("draft")
    release()
    deleteCard(initial.id)
    toast(`Черновик КР ${period} удалён`, {
      action: { label: "Восстановить", onClick: () => saveCard(draft) },
    })
    router.push(exitHref)
  }

  const fillFromPrevious = () => {
    if (!previous) return
    const copied = copyIndicators(previous)
    setKpis(copied.kpis)
    setTasks(copied.tasks)
    setShowErrors(false)
    toast.info(`Показатели скопированы из КР ${formatPeriod(previous.year, previous.quarter)}`)
  }

  return (
    <div className="flex flex-col">
      {returnNote && (
        <div className="mt-3 flex gap-2 rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm">
          <MessageSquareWarningIcon className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <div className="font-medium">{ROLE_COPY[returnNote.by].name} вернул карту на доработку</div>
            <p className="whitespace-pre-line text-muted-foreground">{returnNote.comment}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-1">
        <p className="max-w-3xl text-sm text-muted-foreground">
          Заполните ключевые показатели эффективности и задачи развития деятельности. Суммарный вес
          всех показателей должен составлять 100%. {copy.editorIntro}
        </p>
        {previous && (
          <Button variant="outline" size="sm" onClick={fillFromPrevious}>
            <CopyIcon />
            Заполнить из КР {formatPeriod(previous.year, previous.quarter)}
          </Button>
        )}
      </div>

      <SectionTitle
        aside={
          <Button variant="ghost" size="sm" className="text-primary" onClick={addKpi}>
            <PlusIcon /> Добавить КПЭ
          </Button>
        }
      >
        КПЭ <Subtotal value={totalWeight(kpis)} />
      </SectionTitle>
      <KpiEditTable
        items={kpis}
        onUpdate={(id, patch: Partial<Kpi>) => setKpis((list) => patchById(list, id, patch))}
        onRemove={(id) => setKpis((list) => list.filter((k) => k.id !== id))}
        invalid={invalid}
        focusId={focusId}
      />

      <SectionTitle
        aside={
          <Button variant="ghost" size="sm" className="text-primary" onClick={addTask}>
            <PlusIcon /> Добавить ЗРД
          </Button>
        }
      >
        Задачи развития деятельности <Subtotal value={totalWeight(tasks)} /> <SmartHelp />
      </SectionTitle>
      <TaskEditForm
        items={tasks}
        numberFrom={kpis.length + 1}
        deadline={quarterEndDate(initial.year, initial.quarter)}
        onUpdate={(id, patch: Partial<DevTask>) => setTasks((list) => patchById(list, id, patch))}
        onRemove={(id) => setTasks((list) => list.filter((t) => t.id !== id))}
        invalid={invalid}
        focusId={focusId}
      />

      {showErrors && messages.length > 0 && (
        <div role="alert" className="mt-4 flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <ul className="flex flex-col gap-0.5">
            {messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <StickyFooter className="justify-between gap-x-6 gap-y-3">
        <WeightSummary kpi={totalWeight(kpis)} tasks={totalWeight(tasks)} dirty={dirty} savedAt={savedAt} />
        <div className="flex flex-wrap gap-2">
          {!isNew && (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2Icon /> Удалить
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" onClick={saveDraft} />}>
              <SaveIcon /> Сохранить черновик
            </TooltipTrigger>
            <TooltipContent>Ctrl + S</TooltipContent>
          </Tooltip>
          <Button onClick={requestSend}>
            <SendIcon /> {copy.send.button}
          </Button>
        </div>
      </StickyFooter>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Удалить черновик КР ${period}?`}
        description="Все заполненные показатели и задачи будут удалены. Сразу после удаления действие можно отменить из уведомления."
        confirmLabel="Удалить"
        destructive
        onConfirm={removeDraft}
      />
      <ConfirmDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        title={`Отправить КР ${period} ${copy.send.title}?`}
        description={copy.send.description}
        confirmLabel="Отправить"
        onConfirm={send}
      />
    </div>
  )
}
