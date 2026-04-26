const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
] as const

type DateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function parseDateTimeLocalValue(value: string): DateTimeParts | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  )

  if (!match) {
    return null
  }

  return {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10),
    day: Number.parseInt(match[3], 10),
    hour: Number.parseInt(match[4], 10),
    minute: Number.parseInt(match[5], 10),
    second: Number.parseInt(match[6] ?? "0", 10),
  }
}

function getTimeZoneFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
}

function getTimeZoneDateTimeParts(date: Date, timeZone: string): DateTimeParts {
  const parts = getTimeZoneFormatter(timeZone).formatToParts(date)
  const readPart = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((value) => value.type === type)?.value

    if (!part) {
      throw new Error(`Missing ${type} while formatting time zone parts.`)
    }

    return Number.parseInt(part, 10)
  }

  return {
    year: readPart("year"),
    month: readPart("month"),
    day: readPart("day"),
    hour: readPart("hour"),
    minute: readPart("minute"),
    second: readPart("second"),
  }
}

function dateTimePartsToUtcTimestamp(value: DateTimeParts) {
  return Date.UTC(
    value.year,
    value.month - 1,
    value.day,
    value.hour,
    value.minute,
    value.second,
  )
}

function assertValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date())
  } catch {
    throw new Error("Choose a valid timezone.")
  }
}

function localDateTimeToUtcIso(value: string, timeZone: string) {
  const parsed = parseDateTimeLocalValue(value)

  if (!parsed) {
    throw new Error("Enter a valid date and time.")
  }

  assertValidTimeZone(timeZone)

  const targetTimestamp = dateTimePartsToUtcTimestamp(parsed)
  let candidate = new Date(targetTimestamp)

  for (let index = 0; index < 2; index += 1) {
    const candidateParts = getTimeZoneDateTimeParts(candidate, timeZone)
    const candidateTimestamp = dateTimePartsToUtcTimestamp(candidateParts)
    const difference = candidateTimestamp - targetTimestamp

    if (difference === 0) {
      break
    }

    candidate = new Date(candidate.getTime() - difference)
  }

  return candidate.toISOString()
}

function utcIsoToDateTimeLocalValue(value: string, timeZone: string) {
  assertValidTimeZone(timeZone)

  const parts = getTimeZoneDateTimeParts(new Date(value), timeZone)
  const month = String(parts.month).padStart(2, "0")
  const day = String(parts.day).padStart(2, "0")
  const hour = String(parts.hour).padStart(2, "0")
  const minute = String(parts.minute).padStart(2, "0")

  return `${parts.year}-${month}-${day}T${hour}:${minute}`
}

export { COMMON_TIMEZONES, localDateTimeToUtcIso, utcIsoToDateTimeLocalValue }
