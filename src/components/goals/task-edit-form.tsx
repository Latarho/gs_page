"use client"

import { useId } from "react"
import { checkSmart } from "@/lib/goals/smart"
import type { DevTask } from "@/lib/goals/types"
import { Textarea } from "@/components/ui/textarea"
import { PercentInput } from "./card-parts"
import { type EditTableProps, RemoveButton } from "./kpi-edit-table"
import { SmartBadges, SmartHints } from "./smart-check"
import { FormField, TaskBlock } from "./task-form-list"

/** ЗРД при создании и редактировании карты — форма с проверкой КИС */
export function TaskEditForm({
  items,
  onUpdate,
  onRemove,
  invalid,
  focusId,
  numberFrom,
  deadline,
}: EditTableProps<DevTask> & {
  /** Нумерация продолжает список КПЭ */
  numberFrom: number
  /** Конец квартала карты — для быстрого добавления срока */
  deadline: string
}) {
  // id полей не берём из id задачи: у новой карты он случайный и разный на сервере и клиенте
  const formId = useId()
  const addDeadline = (task: DevTask) =>
    onUpdate(task.id, {
      expectedResult: `${task.expectedResult.trim().replace(/[.;,]+$/, "")} до ${deadline}`,
    })

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-1 py-6 text-center text-sm text-muted-foreground">
        Задачи не добавлены
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((t, i) => {
        const n = numberFrom + i
        const checks = checkSmart(t)
        const strict = invalid(`${t.id}.smart`) === true
        const touched = t.name.trim() !== "" || t.expectedResult.trim() !== ""
        const fieldId = (field: string) => `${formId}-${i}-${field}`
        const hints = (letters: string[]) => (
          <SmartHints
            checks={checks.filter((c) => letters.includes(c.letter))}
            strict={strict}
            deadline={deadline}
            onAddDeadline={() => addDeadline(t)}
          />
        )

        return (
          <TaskBlock
            key={t.id}
            number={n}
            title={<span className="font-normal text-muted-foreground">Задача развития деятельности</span>}
            aside={
              <>
                {touched && <SmartBadges checks={checks} strict={strict} />}
                <RemoveButton label={`Удалить ЗРД ${n}`} onClick={() => onRemove(t.id)} />
              </>
            }
          >
            <FormField label="Наименование ЗРД" htmlFor={fieldId("name")}>
              <Textarea
                id={fieldId("name")}
                rows={2}
                value={t.name}
                placeholder="Начните с глагола: «Внедрить…», «Подготовить…», «Сократить…»"
                autoFocus={t.id === focusId}
                aria-invalid={invalid(`${t.id}.name`)}
                onChange={(e) => onUpdate(t.id, { name: e.target.value })}
                className="min-h-14 resize-none text-[13px]"
              />
              {t.name.trim() && hints(["S"])}
            </FormField>
            <FormField label="Вес, %" htmlFor={fieldId("weight")}>
              <PercentInput
                id={fieldId("weight")}
                value={t.weight}
                aria-invalid={invalid(`${t.id}.weight`)}
                onChange={(weight) => onUpdate(t.id, { weight })}
              />
            </FormField>
            <FormField
              label="Ожидаемый результат"
              htmlFor={fieldId("expected")}
              className="sm:col-span-2"
            >
              <Textarea
                id={fieldId("expected")}
                rows={2}
                value={t.expectedResult}
                placeholder="Что будет считаться выполнением: число или порог и срок — «не менее 95% до 31.12.2026»"
                aria-invalid={invalid(`${t.id}.expectedResult`)}
                onChange={(e) => onUpdate(t.id, { expectedResult: e.target.value })}
                className="min-h-14 resize-none text-[13px]"
              />
              {t.expectedResult.trim() && hints(["M", "T"])}
            </FormField>
          </TaskBlock>
        )
      })}
    </div>
  )
}
