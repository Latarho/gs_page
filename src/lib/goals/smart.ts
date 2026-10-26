import type { DevTask } from "./types"

/**
 * Упрощённая проверка ЗРД по SMART: конкретность (S), измеримость (M)
 * и срок (T). Достижимость и релевантность автоматически не проверить —
 * за них отвечают автор карты и согласующий.
 *
 * Проверка эвристическая: она ищет в тексте признаки критерия,
 * а не понимает смысл формулировки.
 */

export type SmartLetter = "S" | "M" | "T"

export interface SmartCheck {
  letter: SmartLetter
  label: string
  passed: boolean
  /** Что исправить, если критерий не выполнен */
  hint: string
}

const normalize = (text: string) => text.toLowerCase().replace(/ё/g, "е").trim()

const words = (text: string) => normalize(text).split(/[^a-zа-я0-9-]+/i).filter(Boolean)

/** Инфинитив: «подключить», «выполнять», «провести», «развернуться» */
const INFINITIVE = /(ть|ться|ти|тись|чь|чься)$/

const VAGUE = [
  "стараться",
  "постараться",
  "стремиться",
  "пытаться",
  "способствовать",
  "содействовать",
  "участвовать",
  "помогать",
]

// В JS \b не работает с кириллицей — границы слова задаём явно
const MONTHS = /(январ|феврал|марта?(?![а-я])|апрел|мая(?![а-я])|июн|июл|август|сентябр|октябр|ноябр|декабр)/

const DEADLINE: RegExp[] = [
  /\b\d{1,2}\.\d{1,2}(\.\d{2,4})?\b/, // 15.12 или 15.12.2026
  MONTHS,
  /до конца (квартала|месяца|года|полугодия|периода)/,
  /в течение (\d+ )?(дн|недел|месяц|квартал|года)/,
  /ежедневно|еженедельно|ежемесячно|ежеквартально/,
  /\b[1-4] ?(кв(?![а-я])|квартал)/,
  /\b[1-4]q\d{4}\b/,
  /(?<![а-я])срок\S* до(?![а-я])/,
]

const MEASURE: RegExp[] = [
  /\d/,
  /%/,
  /не (менее|более|ниже|выше|превыша)/,
  /в полном объеме/,
  /без (замечаний|ошибок|инцидентов|нарушений|отклонений)/,
]

/** Даты и периоды не считаются измеримым результатом — убираем их перед поиском чисел */
function withoutDeadlines(text: string) {
  return text
    .replace(/\b\d{1,2}\.\d{1,2}(\.\d{2,4})?\b/g, " ")
    .replace(/\b20\d{2}\b/g, " ")
    .replace(/\b[1-4] ?(кв(?![а-я])\.?|квартал\S*)/g, " ")
    .replace(/\b[1-4]q\d{4}\b/g, " ")
    .replace(/в течение \d+/g, " ")
}

function checkSpecific(name: string): SmartCheck {
  const base = { letter: "S" as const, label: "Конкретность" }
  const list = words(name)
  const text = normalize(name)
  if (list.length === 0) {
    return { ...base, passed: false, hint: "Сформулируйте задачу" }
  }
  if (VAGUE.some((v) => list.includes(v)) || text.includes("по возможности")) {
    return {
      ...base,
      passed: false,
      hint: "Избегайте размытых формулировок («способствовать», «стараться», «по возможности») — опишите конкретное действие",
    }
  }
  if (!INFINITIVE.test(list[0])) {
    return {
      ...base,
      passed: false,
      hint: "Начните с глагола действия: «Подготовить…», «Внедрить…», «Сократить…»",
    }
  }
  if (list.length < 3) {
    return { ...base, passed: false, hint: "Уточните, что именно нужно сделать и над каким объектом" }
  }
  return { ...base, passed: true, hint: "Задача начинается с конкретного действия" }
}

function checkMeasurable(expectedResult: string): SmartCheck {
  const base = { letter: "M" as const, label: "Измеримость" }
  const text = withoutDeadlines(normalize(expectedResult))
  const passed = MEASURE.some((re) => re.test(text))
  return {
    ...base,
    passed,
    hint: passed
      ? "В ожидаемом результате есть измеримый показатель"
      : "Добавьте измеримый результат: число, %, количество или порог («не менее 95%», «3 модуля», «без замечаний»)",
  }
}

function checkTimeBound(name: string, expectedResult: string): SmartCheck {
  const base = { letter: "T" as const, label: "Срок" }
  const text = normalize(`${name} ${expectedResult}`)
  const passed = DEADLINE.some((re) => re.test(text))
  return {
    ...base,
    passed,
    hint: passed
      ? "Срок выполнения указан"
      : "Укажите срок: дату («до 15.12.2026») или период («до конца квартала»)",
  }
}

export function checkSmart(task: Pick<DevTask, "name" | "expectedResult">): SmartCheck[] {
  return [
    checkSpecific(task.name),
    checkMeasurable(task.expectedResult),
    checkTimeBound(task.name, task.expectedResult),
  ]
}

export function smartFailures(task: Pick<DevTask, "name" | "expectedResult">) {
  return checkSmart(task).filter((c) => !c.passed)
}
