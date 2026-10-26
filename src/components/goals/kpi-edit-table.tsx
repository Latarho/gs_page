"use client"

import { Trash2Icon } from "lucide-react"
import { KPI_KINDS, KPI_UNITS, KPI_ZONES } from "@/lib/goals/directory"
import type { Kpi, KpiKind } from "@/lib/goals/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { EmptyRow, PercentInput, Th } from "./card-parts"

/** Общие свойства редактируемых списков КПЭ и ЗРД */
export interface EditTableProps<T> {
  items: T[]
  onUpdate: (id: string, patch: Partial<T>) => void
  onRemove: (id: string) => void
  /** Поле с ошибкой валидации: ключ вида `${id}.${поле}` */
  invalid: (key: string) => true | undefined
  /** Строка, которая должна получить фокус (только что добавленная) */
  focusId: string | null
}

export function KpiEditTable({ items, onUpdate, onRemove, invalid, focusId }: EditTableProps<Kpi>) {
  return (
    <Table className="min-w-[1080px] table-fixed text-[13px]">
      <colgroup>
        <col className="w-12" />
        <col />
        <col className="w-24" />
        <col className="w-40" />
        <col className="w-24" />
        <col className="w-64" />
        <col className="w-28" />
        <col className="w-12" />
      </colgroup>
      <TableHeader className="bg-table-head">
        <TableRow className="hover:bg-transparent">
          <Th>№</Th>
          <Th>Наименование КПЭ</Th>
          <Th>Вес</Th>
          <Th>Вид</Th>
          <Th>Ед.изм.</Th>
          <Th>Зона ответственности</Th>
          <Th>План</Th>
          <Th />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((k, i) => {
          const n = i + 1
          return (
            <TableRow key={k.id} className="align-top hover:bg-transparent">
              <TableCell className="pt-4">{n}</TableCell>
              <TableCell>
                <Textarea
                  rows={1}
                  value={k.name}
                  placeholder="Наименование показателя"
                  autoFocus={k.id === focusId}
                  aria-label={`Наименование КПЭ ${n}`}
                  aria-invalid={invalid(`${k.id}.name`)}
                  onChange={(e) => onUpdate(k.id, { name: e.target.value })}
                  className="min-h-8 resize-none py-1.5 text-[13px]"
                />
              </TableCell>
              <TableCell>
                <PercentInput
                  value={k.weight}
                  aria-label={`Вес КПЭ ${n}`}
                  aria-invalid={invalid(`${k.id}.weight`)}
                  onChange={(weight) => onUpdate(k.id, { weight })}
                />
              </TableCell>
              <TableCell>
                <OptionSelect
                  label={`Вид КПЭ ${n}`}
                  value={k.kind}
                  options={KPI_KINDS}
                  onChange={(kind) => onUpdate(k.id, { kind: kind as KpiKind })}
                />
              </TableCell>
              <TableCell>
                <OptionSelect
                  label={`Единица измерения КПЭ ${n}`}
                  value={k.unit}
                  options={KPI_UNITS}
                  onChange={(unit) => onUpdate(k.id, { unit })}
                />
              </TableCell>
              <TableCell>
                <OptionSelect
                  label={`Зона ответственности КПЭ ${n}`}
                  value={k.zone}
                  options={KPI_ZONES}
                  invalid={invalid(`${k.id}.zone`)}
                  wide
                  onChange={(zone) => onUpdate(k.id, { zone })}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={k.plan}
                  placeholder="-"
                  aria-label={`План КПЭ ${n}`}
                  onChange={(e) => onUpdate(k.id, { plan: e.target.value })}
                  className="text-right"
                />
              </TableCell>
              <TableCell>
                <RemoveButton label={`Удалить КПЭ ${n}`} onClick={() => onRemove(k.id)} />
              </TableCell>
            </TableRow>
          )
        })}
        {items.length === 0 && <EmptyRow colSpan={8}>КПЭ не добавлены</EmptyRow>}
      </TableBody>
    </Table>
  )
}

function OptionSelect({
  label,
  value,
  options,
  onChange,
  invalid,
  wide = false,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  invalid?: true
  /** Длинные значения: список шире поля */
  wide?: boolean
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(String(v))}>
      <SelectTrigger className="w-full" aria-label={label} aria-invalid={invalid}>
        <SelectValue placeholder="Выберите" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={!wide} className={wide ? "w-auto" : undefined}>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      onClick={onClick}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2Icon />
    </Button>
  )
}
