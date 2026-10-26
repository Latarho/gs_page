"use client"

import { useState } from "react"
import { CheckCheckIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { formatOptionalPercent as scoreText } from "@/lib/format"
import { isFullyAssessed, patchById, totalWeight } from "@/lib/goals/card"
import { formatPeriod } from "@/lib/goals/period"
import { checkSmart } from "@/lib/goals/smart"
import { saveCard } from "@/lib/goals/store"
import type { DevTask, Kpi, PerformanceCard, Role } from "@/lib/goals/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EmptyRow, PercentInput, SectionTitle, StickyFooter, Th } from "./card-parts"
import { SmartBadges } from "./smart-check"
import { TaskFormList } from "./task-form-list"

/**
 * Просмотр карты. В статусе «Активная» руководитель заполняет факт по КПЭ
 * и свою оценку по ЗРД, а сотрудник — самооценку по ЗРД.
 */
export function CardView({ card, role }: { card: PerformanceCard; role: Role }) {
  const assessing = card.status === "active" && role === "manager"
  const selfAssessing = card.status === "active" && role === "employee"
  const [kpis, setKpis] = useState(card.kpis)
  const [tasks, setTasks] = useState(card.tasks)

  const { markSaved } = useUnsavedChanges([kpis, tasks])

  const updateKpi = (id: string, patch: Partial<Kpi>) => setKpis((list) => patchById(list, id, patch))
  const updateTask = (id: string, patch: Partial<DevTask>) =>
    setTasks((list) => patchById(list, id, patch))

  const period = formatPeriod(card.year, card.quarter)

  const saveSelf = () => {
    saveCard({ ...card, tasks })
    markSaved()
    toast.success("Самооценка сохранена")
  }

  const save = (finish: boolean) => {
    if (finish && !isFullyAssessed({ kpis, tasks })) {
      toast.error("Заполните оценку по всем КПЭ и ЗРД")
      return
    }
    markSaved()
    saveCard({ ...card, kpis, tasks, status: finish ? "assessed" : "active" })
    toast.success(finish ? `Оценка КР ${period} завершена` : "Оценка сохранена", {
      action: finish
        ? { label: "Отменить", onClick: () => saveCard({ ...card, kpis, tasks, status: "active" }) }
        : undefined,
    })
  }

  return (
    <div className="flex flex-col">
      <SectionTitle>КПЭ</SectionTitle>
      <Table className="min-w-[1080px] table-fixed text-[13px]">
        <colgroup>
          <col className="w-12" />
          <col className="w-[22%]" />
          <col className="w-16" />
          <col className="w-28" />
          <col className="w-20" />
          <col className="w-[22%]" />
          <col className="w-20" />
          <col className="w-24" />
          <col className="w-28" />
          <col className="w-28" />
        </colgroup>
        <TableHeader className="bg-table-head">
          <TableRow className="hover:bg-transparent">
            <Th>№</Th>
            <Th>Наименование КПЭ</Th>
            <Th>Вес</Th>
            <Th>Вид</Th>
            <Th>Ед.изм.</Th>
            <Th>Зона ответственности</Th>
            <Th className="text-right">План</Th>
            <Th className="text-right">Факт</Th>
            <Th className="text-right">Знач. выпол. КПЭ</Th>
            <Th className="text-right">Оценка, %</Th>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpis.map((k, i) => (
            <TableRow key={k.id} className="hover:bg-transparent">
              <TableCell>{i + 1}</TableCell>
              <TableCell className="whitespace-normal text-primary">{k.name}</TableCell>
              <TableCell>{k.weight}%</TableCell>
              <TableCell>{k.kind}</TableCell>
              <TableCell>{k.unit}</TableCell>
              <TableCell className="whitespace-normal">{k.zone}</TableCell>
              <TableCell className="text-right">{k.plan || "-"}</TableCell>
              {assessing ? (
                <>
                  <TableCell>
                    <Input value={k.fact} aria-label="Факт" onChange={(e) => updateKpi(k.id, { fact: e.target.value })} className="text-right" />
                  </TableCell>
                  <TableCell>
                    <Input value={k.value} aria-label="Значение выполнения КПЭ" onChange={(e) => updateKpi(k.id, { value: e.target.value })} className="text-right" />
                  </TableCell>
                  <TableCell>
                    <PercentInput value={k.score} aria-label="Оценка КПЭ" onChange={(score) => updateKpi(k.id, { score })} />
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="text-right">{k.fact}</TableCell>
                  <TableCell className="text-right">{k.value}</TableCell>
                  <TableCell className="text-right font-semibold">{scoreText(k.score)}</TableCell>
                </>
              )}
            </TableRow>
          ))}
          {kpis.length === 0 && <EmptyRow colSpan={10}>КПЭ не установлены</EmptyRow>}
        </TableBody>
      </Table>

      <SectionTitle>Задачи развития деятельности</SectionTitle>
      {/* Оценённая карта — итоговый документ: ЗРД показываем формой, а не таблицей */}
      {card.status === "assessed" ? (
        <TaskFormList tasks={tasks} numberFrom={kpis.length + 1} />
      ) : (
        <Table className="min-w-[1180px] table-fixed text-[13px]">
          <colgroup>
            <col className="w-12" />
            <col className="w-[17%]" />
            <col className="w-16" />
            <col className="w-[17%]" />
            <col className="w-[16%]" />
            <col className="w-28" />
            <col />
            <col className="w-32" />
          </colgroup>
          <TableHeader className="bg-table-head">
            <TableRow className="hover:bg-transparent">
              <Th>№</Th>
              <Th>Наименование ЗРД</Th>
              <Th>Вес</Th>
              <Th>Ожидаемый результат</Th>
              <Th>Достигнутый результат (самооценка)</Th>
              <Th>Самооценка, %</Th>
              <Th>Выполнение (оценка руководителя)</Th>
              <Th className="text-right">Оценка руководителя, %</Th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t, i) => (
              <TableRow key={t.id} className="hover:bg-transparent">
                <TableCell>{kpis.length + i + 1}</TableCell>
                <TableCell className="whitespace-normal">
                  {t.name}
                  {/* Согласующему видно, как формулировки проходят SMART */}
                  {card.status === "approval" && (
                    <div className="mt-1.5">
                      <SmartBadges checks={checkSmart(t)} />
                    </div>
                  )}
                </TableCell>
                <TableCell>{t.weight}%</TableCell>
                <TableCell className="whitespace-normal">{t.expectedResult}</TableCell>
                {selfAssessing ? (
                  <>
                    <TableCell>
                      <Textarea
                        rows={2}
                        value={t.selfResult}
                        placeholder="Что сделано по задаче"
                        aria-label="Достигнутый результат (самооценка)"
                        onChange={(e) => updateTask(t.id, { selfResult: e.target.value })}
                        className="min-h-14 text-[13px]"
                      />
                    </TableCell>
                    <TableCell>
                      <PercentInput value={t.selfScore} aria-label="Самооценка" onChange={(selfScore) => updateTask(t.id, { selfScore })} />
                    </TableCell>
                  </>
                ) : role === "manager" ? (
                  <>
                    <TableCell>
                      <EmployeeField value={t.selfResult} />
                    </TableCell>
                    <TableCell>
                      <EmployeeField value={scoreText(t.selfScore)} />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="whitespace-pre-line">{t.selfResult}</TableCell>
                    <TableCell>{scoreText(t.selfScore)}</TableCell>
                  </>
                )}
                {assessing ? (
                  <>
                    <TableCell>
                      <Textarea
                        rows={2}
                        value={t.managerResult}
                        placeholder="Комментарий о выполнении"
                        aria-label="Выполнение (оценка руководителя)"
                        onChange={(e) => updateTask(t.id, { managerResult: e.target.value })}
                        className="min-h-14 text-[13px]"
                      />
                    </TableCell>
                    <TableCell>
                      <PercentInput value={t.managerScore} aria-label="Оценка руководителя" onChange={(managerScore) => updateTask(t.id, { managerScore })} />
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="whitespace-pre-line">{t.managerResult}</TableCell>
                    <TableCell className="text-right font-semibold">{scoreText(t.managerScore)}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <p className="px-1 pt-3 text-xs text-muted-foreground">
        Суммарный вес показателей: {totalWeight([...kpis, ...tasks])}%
      </p>

      {assessing && (
        <StickyFooter className="justify-end">
          <Button variant="outline" onClick={() => save(false)}>
            Сохранить оценку
          </Button>
          <Button onClick={() => save(true)}>
            <CheckCheckIcon /> Завершить оценку
          </Button>
        </StickyFooter>
      )}

      {selfAssessing && (
        <StickyFooter className="justify-between">
          <p className="text-sm text-muted-foreground">
            Заполните достигнутый результат и самооценку по каждой задаче — руководитель учтёт их при
            оценке.
          </p>
          <Button onClick={saveSelf}>Сохранить самооценку</Button>
        </StickyFooter>
      )}
    </div>
  )
}

/** Поле, которое заполняет сотрудник: руководителю доступно только для чтения */
function EmployeeField({ value }: { value: string }) {
  return (
    <div className="flex min-h-8 items-stretch rounded-md bg-muted text-[13px]">
      <span className="flex-1 px-2 py-1.5 whitespace-pre-line">{value}</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              tabIndex={0}
              className="flex w-7 items-center justify-center border-l border-background text-muted-foreground"
            />
          }
        >
          <PencilIcon className="size-3" aria-label="Заполняется сотрудником" />
        </TooltipTrigger>
        <TooltipContent>Заполняется сотрудником</TooltipContent>
      </Tooltip>
    </div>
  )
}
