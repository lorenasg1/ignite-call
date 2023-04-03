type GetWeekDays = {
  short?: boolean
}

export function getWeekDays({ short = false }: GetWeekDays = {}) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })

  return Array.from(Array(7).keys())
    .map((day) => formatter.format(new Date(Date.UTC(2021, 5, day))))
    .map((weekDay) => {
      if (short) {
        return weekDay.substring(0, 3)
      }
      return weekDay
    })
}
