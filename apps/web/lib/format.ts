const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getDateTimeFormatter(timeZone: string, options?: Intl.DateTimeFormatOptions) {
  const cacheKey = JSON.stringify({ timeZone, options })
  const existing = dateTimeFormatterCache.get(cacheKey)

  if (existing) {
    return existing
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
    ...options,
  })

  dateTimeFormatterCache.set(cacheKey, formatter)
  return formatter
}

function formatAppointmentDate(date: string | Date, timeZone: string) {
  const value = typeof date === "string" ? new Date(date) : date
  return getDateTimeFormatter(timeZone).format(value)
}

function formatMetricNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatCompactDay(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`))
}

function formatRelativeSchedule(date: string | Date) {
  const value = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value)
}

export {
  formatAppointmentDate,
  formatCompactDay,
  formatMetricNumber,
  formatRelativeSchedule,
}
