const REQUIRED_IMPORT_COLUMNS = [
  "customer_name",
  "customer_email",
  "appointment_title",
  "starts_at",
  "timezone",
] as const

const OPTIONAL_IMPORT_COLUMNS = [
  "phone",
  "contact_timezone",
  "display_timezone",
  "location_name",
  "ends_at",
  "external_reference",
  "email_opt_out",
] as const

type CsvPreviewRow = {
  rowNumber: number
  values: Record<string, string>
  issues: string[]
}

type CsvPreview = {
  columns: string[]
  rows: CsvPreviewRow[]
  missingColumns: string[]
}

function parseCsvText(text: string) {
  const rows: string[][] = []
  let currentField = ""
  let currentRow: string[] = []
  let insideQuotes = false
  const normalizedText = text.replace(/^\uFEFF/, "")

  for (let index = 0; index < normalizedText.length; index += 1) {
    const character = normalizedText[index]
    const nextCharacter = normalizedText[index + 1]

    if (insideQuotes) {
      if (character === '"' && nextCharacter === '"') {
        currentField += '"'
        index += 1
        continue
      }

      if (character === '"') {
        insideQuotes = false
        continue
      }

      currentField += character
      continue
    }

    if (character === '"') {
      insideQuotes = true
      continue
    }

    if (character === ",") {
      currentRow.push(currentField)
      currentField = ""
      continue
    }

    if (character === "\r") {
      continue
    }

    if (character === "\n") {
      currentRow.push(currentField)
      rows.push(currentRow)
      currentField = ""
      currentRow = []
      continue
    }

    currentField += character
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  return rows
}

function isValidTimezone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date())
    return true
  } catch {
    return false
  }
}

function parseImportCsvPreview(text: string): CsvPreview {
  const rows = parseCsvText(text)

  if (rows.length === 0) {
    return {
      columns: [],
      rows: [],
      missingColumns: [...REQUIRED_IMPORT_COLUMNS],
    }
  }

  const columns = rows[0].map((value) => value.trim())
  const missingColumns = REQUIRED_IMPORT_COLUMNS.filter(
    (column) => !columns.includes(column),
  )

  const previewRows = rows
    .slice(1)
    .map((cells, index) => {
      const values = Object.fromEntries(
        columns.map((column, columnIndex) => [column, cells[columnIndex]?.trim() ?? ""]),
      )

      const issues: string[] = []
      for (const requiredColumn of REQUIRED_IMPORT_COLUMNS) {
        if (!values[requiredColumn]) {
          issues.push(`${requiredColumn} is required.`)
        }
      }

      if (values.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customer_email)) {
        issues.push("customer_email must be a valid email.")
      }

      if (values.starts_at && Number.isNaN(Date.parse(values.starts_at))) {
        issues.push("starts_at must be a valid date/time value.")
      }

      if (values.ends_at && Number.isNaN(Date.parse(values.ends_at))) {
        issues.push("ends_at must be a valid date/time value.")
      }

      if (values.timezone && !isValidTimezone(values.timezone)) {
        issues.push("timezone must be a valid IANA timezone.")
      }

      if (values.contact_timezone && !isValidTimezone(values.contact_timezone)) {
        issues.push("contact_timezone must be a valid IANA timezone.")
      }

      if (values.display_timezone && !isValidTimezone(values.display_timezone)) {
        issues.push("display_timezone must be a valid IANA timezone.")
      }

      if (
        values.email_opt_out &&
        !["true", "false", "1", "0", "yes", "no", "y", "n"].includes(
          values.email_opt_out.toLowerCase(),
        )
      ) {
        issues.push("email_opt_out must be a boolean-like value.")
      }

      return {
        rowNumber: index + 2,
        values,
        issues,
      }
    })
    .filter((row) => Object.values(row.values).some((value) => value.length > 0))

  return {
    columns,
    rows: previewRows,
    missingColumns,
  }
}

const IMPORT_TEMPLATE_CSV = [
  [...REQUIRED_IMPORT_COLUMNS, ...OPTIONAL_IMPORT_COLUMNS].join(","),
  [
    "Jane Doe",
    "jane@example.com",
    "Initial Consultation",
    "2026-05-02T14:00:00.000Z",
    "America/New_York",
    "+1 555 010 1200",
    "America/New_York",
    "America/New_York",
    "Video Consultation Room",
    "2026-05-02T14:45:00.000Z",
    "CRM-2026-0001",
    "false",
  ].join(","),
].join("\n")

export type { CsvPreview, CsvPreviewRow }
export {
  IMPORT_TEMPLATE_CSV,
  OPTIONAL_IMPORT_COLUMNS,
  REQUIRED_IMPORT_COLUMNS,
  parseImportCsvPreview,
}
