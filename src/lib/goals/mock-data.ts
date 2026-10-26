import { cardId } from "./period"
import type { DevTask, Employee, Kpi, Manager, PerformanceCard, Quarter } from "./types"

export const CURRENT_USER = {
  fullName: "Подсадный Александр Иванович",
  initials: "АП",
  role: "Делегат руководителя",
}

/** Сотрудник, от лица которого открывается экран «Мои карты» (демо) */
export const CURRENT_EMPLOYEE_ID = "m1-e1"

export const KPI_ZONES = [
  "[ВСП1] Управление развития общекорпоративных систем",
  "[ВСП2] Управление финансовых систем",
  "[ЦИ1] Управление эксплуатации",
]

export const KPI_UNITS = ["%", "шт.", "дн.", "ч", "руб."]

export const MANAGERS: Manager[] = [
  { id: "m1", fullName: "Подсадный Александр Иванович", initials: "АП", zone: KPI_ZONES[0] },
  { id: "m2", fullName: "Мухина Ирина Владимировна", initials: "ИМ", zone: KPI_ZONES[1] },
]

const DEPT_HR =
  "Департамент автоматизации внутренних сервисов / Управление развития общекорпоративных систем / Отдел систем подбора и развития персонала"
const DEPT_HRM =
  "Департамент автоматизации внутренних сервисов / Управление развития общекорпоративных систем / Отдел систем управления персоналом"
const DEPT_FIN =
  "Департамент автоматизации внутренних сервисов / Управление финансовых систем / Отдел систем бухгалтерского учёта"
const DEPT_DOC =
  "Департамент автоматизации внутренних сервисов / Управление финансовых систем / Отдел электронного документооборота"
const DEPT_INFRA =
  "Департамент цифровой инфраструктуры / Управление эксплуатации / Отдел сопровождения прикладных систем"

const m1Employees: Array<[string, string, string]> = [
  ["Логинов Денис Викторович", "главный руководитель проекта", DEPT_HR],
  ["Тронин Андрей Борисович", "начальник отдела", DEPT_HRM],
  ["Помыткин Сергей Олегович", "руководитель экспертизы по тестированию", DEPT_HR],
  ["Кудрявцев Антон Александрович", "главный инженер разработки", DEPT_HR],
  ["Латыпов Вадим Русланович", "главный инженер разработки", DEPT_HR],
  ["Овчеров Андрей Петрович", "главный инженер разработки", DEPT_HR],
  ["Кочетков Александр Вячеславович", "главный инженер разработки", DEPT_HR],
  ["Савельева Марина Игоревна", "ведущий аналитик", DEPT_HRM],
  ["Гречко Павел Дмитриевич", "ведущий инженер разработки", DEPT_HRM],
]

const m2Employees: Array<[string, string, string]> = [
  ["Абрамова Елена Сергеевна", "начальник отдела", DEPT_FIN],
  ["Белов Игорь Николаевич", "главный эксперт", DEPT_FIN],
  ["Васильев Максим Андреевич", "ведущий инженер разработки", DEPT_FIN],
  ["Глебова Ольга Викторовна", "главный аналитик", DEPT_FIN],
  ["Давыдов Роман Юрьевич", "инженер разработки", DEPT_FIN],
  ["Егорова Наталья Петровна", "ведущий аналитик", DEPT_FIN],
  ["Жуков Кирилл Олегович", "руководитель направления", DEPT_DOC],
  ["Зайцева Анна Михайловна", "главный инженер разработки", DEPT_DOC],
  ["Ильин Виктор Сергеевич", "ведущий инженер разработки", DEPT_DOC],
  ["Карпова Дарья Алексеевна", "аналитик", DEPT_DOC],
  ["Лебедев Артём Игоревич", "инженер по тестированию", DEPT_DOC],
  ["Морозова Светлана Юрьевна", "руководитель экспертизы по тестированию", DEPT_DOC],
  ["Никитин Глеб Валерьевич", "архитектор решений", DEPT_DOC],
  ["Орлова Татьяна Андреевна", "начальник отдела", DEPT_INFRA],
  ["Павлов Евгений Михайлович", "главный инженер сопровождения", DEPT_INFRA],
  ["Романова Юлия Дмитриевна", "ведущий инженер сопровождения", DEPT_INFRA],
  ["Семёнов Илья Константинович", "инженер сопровождения", DEPT_INFRA],
  ["Тихонова Вера Александровна", "ведущий аналитик", DEPT_INFRA],
  ["Устинов Денис Романович", "главный инженер сопровождения", DEPT_INFRA],
  ["Фролова Ксения Олеговна", "аналитик", DEPT_INFRA],
  ["Харитонов Олег Ильич", "ведущий инженер сопровождения", DEPT_INFRA],
  ["Цветкова Алина Павловна", "инженер сопровождения", DEPT_INFRA],
  ["Шарапов Никита Евгеньевич", "главный эксперт", DEPT_INFRA],
]

function toEmployees(
  managerId: string,
  goalGroup: string,
  rows: Array<[string, string, string]>,
  indirectEvery: number
): Employee[] {
  return rows.map(([fullName, position, department], i) => ({
    id: `${managerId}-e${i + 1}`,
    managerId,
    fullName,
    position,
    department,
    goalGroup,
    // Руководители отделов и часть сотрудников — непрямое подчинение
    direct: (i + 1) % indirectEvery !== 0,
  }))
}

export const EMPLOYEES: Employee[] = [
  ...toEmployees("m1", "Блок ИТ и ЦТ", m1Employees, 100),
  ...toEmployees("m2", "Блок финансов и ИТ", m2Employees, 6),
]

function kpi(score: number, zone: string): Kpi {
  return {
    id: "k1",
    name: "Интегральная Доступность бизнес-процессов (АС)",
    weight: 15,
    kind: "Основной",
    unit: "%",
    zone,
    plan: "-",
    fact: "100",
    value: "100",
    score,
  }
}

function tasks(lastScore: number, quarter: Quarter): DevTask[] {
  return [
    {
      id: "t1",
      name: "Выполнять задачи руководителя",
      weight: 20,
      expectedResult: "Поручения руководителя выполнены качественно и в полном объеме",
      selfResult: "",
      selfScore: null,
      managerResult: "выполнено",
      managerScore: 100,
    },
    {
      id: "t2",
      name: "Подключить новые сервисы (видов сведений) СМЭВ 3 и СМЭВ 4",
      weight: 40,
      expectedResult:
        "Подключены новые сервисы в соответствии с требованиями регуляторов и запросами бизнес-подразделений в согласованные сроки",
      selfResult: "",
      selfScore: null,
      managerResult:
        quarter === 1
          ? [
              "1. Внедрен модуль «Одно Окно экспортера», начало ПЭ 24.01.2026.",
              "2. Внедрен модуль «ФНС.Запросы АВК», начало ПЭ 28.02.2026.",
              "3. Внедрен модуль «ЕСИА. Цифровой профиль (Offline-режим)», реальный ЭДО в проме с 23.03.2026.",
              "4. Внедрен модуль «ФНС. Транспорт СМЭВ для документов контрольных мероприятий». Начало ПЭ по ОРД - 28.03.2026.",
              "5. Перезапущен после простоя модуль «ЕСИА. Поиск УЗ». Установлен в пром 17.03.2026",
            ].join("\n")
          : "Подключены сервисы ФНС и ФССП в соответствии с планом квартала",
      managerScore: 100,
    },
    {
      id: "t3",
      name: "Осуществить реализацию стрима «Автоматизация и развитие процессов и сервисов HR» в соответствии с планом",
      weight: 25,
      expectedResult:
        "Выполнение показателя оценивается на основание оценки по проекту/стриму в рамках утверждения на УК/КУБ",
      selfResult: "",
      selfScore: null,
      managerResult: `На УК утверждена оценка ${quarter} кв. - ${lastScore}%`,
      managerScore: lastScore,
    },
  ]
}

function assessedCard(
  employee: Employee,
  year: number,
  quarter: Quarter,
  lastScore: number
): PerformanceCard {
  const zone = MANAGERS.find((m) => m.id === employee.managerId)?.zone ?? KPI_ZONES[0]
  return {
    id: cardId(employee.id, year, quarter),
    employeeId: employee.id,
    year,
    quarter,
    status: "assessed",
    author: "manager",
    goalGroup: employee.goalGroup,
    kpis: [kpi(100, zone)],
    tasks: tasks(lastScore, quarter),
    updatedAt: `${year}-0${quarter * 3}-28T10:00:00.000Z`,
  }
}

function seedCards(): PerformanceCard[] {
  const cards: PerformanceCard[] = []
  EMPLOYEES.forEach((employee, i) => {
    // 2025 — все кварталы оценены
    for (const q of [1, 2, 3, 4] as Quarter[]) {
      cards.push(assessedCard(employee, 2025, q, [100, 92, 96, 100][(i + q) % 4]))
    }
    // 2026: 1Q и 2Q оценены; 2Q — 97.273% итог
    cards.push(assessedCard(employee, 2026, 1, 100))
    cards.push(assessedCard(employee, 2026, 2, 89.092))
    // У части сотрудников второго руководителя 3Q2026 уже активна
    if (employee.managerId === "m2" && i % 3 === 0) {
      cards.push({ ...assessedCard(employee, 2026, 3, 0), status: "active" })
      const last = cards[cards.length - 1]
      last.kpis = last.kpis.map((k) => ({ ...k, fact: "", value: "", score: null }))
      last.tasks = last.tasks.map((t) => ({ ...t, managerResult: "", managerScore: null }))
    }
  })
  return cards
}

export const SEED_CARDS: Record<string, PerformanceCard> = Object.fromEntries(
  seedCards().map((c) => [c.id, c])
)
