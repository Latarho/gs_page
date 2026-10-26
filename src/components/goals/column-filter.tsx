"use client"

import { FilterIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function TriggerIcon({ active, icon: Icon, label }: { active: boolean; icon: typeof FilterIcon; label: string }) {
  return (
    <PopoverTrigger
      render={
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground",
            active && "text-primary hover:text-primary"
          )}
        />
      }
    >
      <Icon className={cn("size-3.5", active && "fill-primary/20")} />
    </PopoverTrigger>
  )
}

/** Фильтр по списку значений в заголовке колонки */
export function ColumnValuesFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const toggle = (value: string, checked: boolean) =>
    onChange(checked ? [...selected, value] : selected.filter((v) => v !== value))

  return (
    <Popover>
      <TriggerIcon active={selected.length > 0} icon={FilterIcon} label={`Фильтр: ${label}`} />
      <PopoverContent align="end" className="w-80 gap-1 p-1.5">
        <div className="max-h-72 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Checkbox
                className="mt-0.5"
                checked={selected.includes(option)}
                onCheckedChange={(checked) => toggle(option, checked)}
              />
              <span className="leading-snug">{option}</span>
            </label>
          ))}
        </div>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => onChange([])}>
            <XIcon /> Сбросить фильтр
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

/** Поиск по тексту в заголовке колонки */
export function ColumnSearchFilter({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Popover>
      <TriggerIcon active={value.trim().length > 0} icon={SearchIcon} label={`Поиск: ${label}`} />
      <PopoverContent align="end" className="w-64">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Поиск по ФИО"
            className="pl-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
