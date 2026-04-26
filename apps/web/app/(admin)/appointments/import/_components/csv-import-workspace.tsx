"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCcw,
  TriangleAlert,
  Upload,
} from "lucide-react"

import { importAppointmentsCsv, type CsvImportResult } from "@/lib/api"
import {
  IMPORT_TEMPLATE_CSV,
  OPTIONAL_IMPORT_COLUMNS,
  REQUIRED_IMPORT_COLUMNS,
  parseImportCsvPreview,
  type CsvPreview,
} from "@/lib/csv"

const MAX_IMPORT_FILE_SIZE = 2_000_000
const PREVIEW_ROW_LIMIT = 6

function CsvImportWorkspace() {
  const queryClient = useQueryClient()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<CsvPreview | null>(null)
  const [previewError, setPreviewError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const templateHref = React.useMemo(
    () => `data:text/csv;charset=utf-8,${encodeURIComponent(IMPORT_TEMPLATE_CSV)}`,
    [],
  )

  const mutation = useMutation({
    mutationFn: importAppointmentsCsv,
    onSuccess: async () => {
      await queryClient.invalidateQueries()
    },
  })

  const previewStats = React.useMemo(() => {
    if (!preview) {
      return {
        validRows: 0,
        invalidRows: 0,
      }
    }

    let validRows = 0
    let invalidRows = 0

    for (const row of preview.rows) {
      if (row.issues.length > 0) {
        invalidRows += 1
      } else {
        validRows += 1
      }
    }

    return { validRows, invalidRows }
  }, [preview])

  const canImport =
    Boolean(selectedFile) &&
    Boolean(preview) &&
    (preview?.rows.length ?? 0) > 0 &&
    (preview?.missingColumns.length ?? 0) === 0 &&
    !mutation.isPending

  const readFile = React.useCallback(async (file: File) => {
    setPreviewError(null)
    mutation.reset()

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFile(null)
      setPreview(null)
      setPreviewError("Upload a .csv file.")
      return
    }

    if (file.size > MAX_IMPORT_FILE_SIZE) {
      setSelectedFile(null)
      setPreview(null)
      setPreviewError("The CSV file must be smaller than 2 MB.")
      return
    }

    try {
      const text = await file.text()
      const nextPreview = parseImportCsvPreview(text)

      if (nextPreview.rows.length === 0) {
        setSelectedFile(file)
        setPreview(nextPreview)
        setPreviewError("The CSV file does not contain any data rows.")
        return
      }

      setSelectedFile(file)
      setPreview(nextPreview)
    } catch {
      setSelectedFile(null)
      setPreview(null)
      setPreviewError("Unable to read that CSV file.")
    }
  }, [mutation])

  const onFileChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      await readFile(file)
    },
    [readFile],
  )

  const onDrop = React.useCallback(
    async (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDragging(false)

      const file = event.dataTransfer.files?.[0]
      if (!file) {
        return
      }

      await readFile(file)
    },
    [readFile],
  )

  const resetWorkspace = React.useCallback(() => {
    setSelectedFile(null)
    setPreview(null)
    setPreviewError(null)
    mutation.reset()

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [mutation])

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.45fr]">
      <aside className="space-y-6">
        <section className="surface-panel p-6">
          <div className="mb-5 space-y-2">
            <p className="text-micro">CSV Contract</p>
            <h2 className="text-2xl font-bold text-foreground">Required Columns</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              The API already validates each row. This preview catches obvious issues before you
              send the file and keeps the import flow believable for client demos.
            </p>
          </div>

          <div className="space-y-3">
            {REQUIRED_IMPORT_COLUMNS.map((column) => (
              <div key={column} className="surface-inset flex items-start gap-3 p-4">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-sm font-semibold text-foreground">{column}</p>
                  <p className="text-sm text-muted-foreground">
                    {getColumnDescription(column)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-border/70 bg-muted/60 px-5 py-4">
            <p className="text-micro">Optional Columns</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {OPTIONAL_IMPORT_COLUMNS.join(", ")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={templateHref}
              download="appointment-import-template.csv"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Template
            </a>
            <Link
              href="/appointments"
              className="inline-flex h-10 items-center justify-center rounded-full border border-transparent px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to roster
            </Link>
          </div>
        </section>

        <section className="surface-panel p-6">
          <p className="text-micro">Import Rules</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Maximum file size is 2 MB because the backend enforces that limit.</p>
            <p>The API imports valid rows and returns row-level errors for the rest.</p>
            <p>Use ISO 8601 date values for the cleanest result across US, Canada, and UK timezones.</p>
          </div>
        </section>
      </aside>

      <div className="space-y-6">
        <section className="surface-panel p-6">
          <label
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed px-6 text-center transition-colors ${
              isDragging
                ? "border-secondary bg-secondary/8"
                : "border-border/80 bg-muted/40 hover:bg-muted/60"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={onFileChange}
            />
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm">
              <Upload className="h-8 w-8 text-secondary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
                Drag and drop your CSV
              </h3>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Or click anywhere in this panel to browse. Keep the file under 2 MB and match the
                template columns for the smoothest import.
              </p>
            </div>

            <div className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10 transition-opacity hover:opacity-90">
              Select File
            </div>

            {selectedFile ? (
              <div className="mt-6 rounded-full border border-border/70 bg-card px-4 py-2 text-sm text-foreground">
                {selectedFile.name}
              </div>
            ) : null}
          </label>

          {previewError ? (
            <div className="mt-4 rounded-3xl border border-destructive/15 bg-destructive/8 px-5 py-4 text-sm text-destructive">
              {previewError}
            </div>
          ) : null}
        </section>

        {preview ? (
          <section className="surface-panel overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-micro">Data Preview</p>
                <h2 className="text-2xl font-bold text-foreground">Review Rows Before Import</h2>
              </div>
              <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/60 px-4 py-2 font-mono text-xs text-muted-foreground">
                {selectedFile?.name ?? "no-file.csv"}
              </div>
            </div>

            <div className="space-y-5 p-6">
              {preview.missingColumns.length > 0 ? (
                <div className="rounded-3xl border border-destructive/15 bg-destructive/8 px-5 py-4 text-sm text-destructive">
                  Missing required columns: {preview.missingColumns.join(", ")}.
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                  label="Rows Detected"
                  value={String(preview.rows.length)}
                  tone="default"
                />
                <SummaryCard
                  label="Preview Valid"
                  value={String(previewStats.validRows)}
                  tone="success"
                />
                <SummaryCard
                  label="Preview Issues"
                  value={String(previewStats.invalidRows)}
                  tone={previewStats.invalidRows > 0 ? "danger" : "default"}
                />
              </div>

              <div className="overflow-x-auto rounded-3xl border border-border/70">
                <table className="min-w-full border-collapse">
                  <thead className="bg-muted/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Row
                      </th>
                      {preview.columns.map((column) => (
                        <th
                          key={column}
                          className="px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                        >
                          {column}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Validation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, PREVIEW_ROW_LIMIT).map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={`border-t border-border/70 ${
                          row.issues.length > 0 ? "bg-destructive/6" : "hover:bg-accent/30"
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-sm text-foreground">
                          {row.rowNumber}
                        </td>
                        {preview.columns.map((column) => (
                          <td
                            key={`${row.rowNumber}-${column}`}
                            className="px-4 py-3 align-top text-sm text-foreground"
                          >
                            <span className="block max-w-52 truncate">
                              {row.values[column] || "—"}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-3 align-top text-sm">
                          {row.issues.length > 0 ? (
                            <div className="space-y-1 text-destructive">
                              {row.issues.map((issue) => (
                                <p key={issue} className="flex items-start gap-2">
                                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                  <span>{issue}</span>
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.rows.length > PREVIEW_ROW_LIMIT ? (
                <p className="text-sm text-muted-foreground">
                  Showing the first {PREVIEW_ROW_LIMIT} rows of {preview.rows.length}. The full file
                  will still be uploaded.
                </p>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Import continues even if some rows fail. The backend returns row-level errors and
                  warnings after upload.
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetWorkspace}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-border/80 bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                  >
                    Reset File
                  </button>
                  <button
                    type="button"
                    onClick={() => selectedFile && mutation.mutate(selectedFile)}
                    disabled={!canImport}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-slate-900/10 transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-55"
                  >
                    {mutation.isPending ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Import CSV
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {mutation.error ? (
          <section className="surface-panel p-6">
            <div className="rounded-3xl border border-destructive/15 bg-destructive/8 px-5 py-4 text-sm text-destructive">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "CSV import failed."}
            </div>
          </section>
        ) : null}

        {mutation.data ? <ImportResults result={mutation.data} /> : null}
      </div>
    </div>
  )
}

function ImportResults({ result }: { result: CsvImportResult }) {
  return (
    <section className="surface-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-micro">Import Result</p>
          <h2 className="text-2xl font-bold text-foreground">Upload Summary</h2>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-10 items-center justify-center rounded-full border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh View
        </button>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryCard label="Rows Processed" value={String(result.totalRows)} tone="default" />
          <SummaryCard label="Imported" value={String(result.importedCount)} tone="success" />
          <SummaryCard
            label="Warnings"
            value={String(result.warningCount)}
            tone={result.warningCount > 0 ? "warning" : "default"}
          />
          <SummaryCard
            label="Errors"
            value={String(result.errorCount)}
            tone={result.errorCount > 0 ? "danger" : "default"}
          />
        </div>

        {result.imported.length > 0 ? (
          <ResultCard
            title="Imported Rows"
            tone="success"
            items={result.imported.map((row) => ({
              key: `${row.row}-${row.appointmentId}`,
              label: `Row ${row.row}`,
              message: `Appointment ${row.appointmentId} created with ${row.plannedEventCount} planned reminder events.`,
            }))}
          />
        ) : null}

        {result.warnings.length > 0 ? (
          <ResultCard
            title="Warnings"
            tone="warning"
            items={result.warnings.map((warning) => ({
              key: `${warning.row}-${warning.message}`,
              label: `Row ${warning.row}`,
              message: warning.message,
            }))}
          />
        ) : null}

        {result.errors.length > 0 ? (
          <ResultCard
            title="Errors"
            tone="danger"
            items={result.errors.map((error) => ({
              key: `${error.row}-${error.message}`,
              label: `Row ${error.row}`,
              message: error.message,
            }))}
          />
        ) : null}
      </div>
    </section>
  )
}

function ResultCard({
  title,
  tone,
  items,
}: {
  title: string
  tone: "success" | "warning" | "danger"
  items: Array<{
    key: string
    label: string
    message: string
  }>
}) {
  const toneClassName =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-800"
      : tone === "warning"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-800"
        : "border-destructive/15 bg-destructive/8 text-destructive"

  const icon =
    tone === "success" ? (
      <CheckCircle2 className="h-5 w-5" />
    ) : tone === "warning" ? (
      <AlertTriangle className="h-5 w-5" />
    ) : (
      <TriangleAlert className="h-5 w-5" />
    )

  return (
    <div className={`rounded-3xl border px-5 py-4 ${toneClassName}`}>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="rounded-2xl border border-current/12 bg-white/45 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">{item.label}</p>
            <p className="mt-1 text-sm leading-6">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "default" | "success" | "warning" | "danger"
}) {
  const className =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/10"
      : tone === "warning"
        ? "border-amber-500/20 bg-amber-500/10"
        : tone === "danger"
          ? "border-destructive/15 bg-destructive/8"
          : "border-border/70 bg-muted/60"

  return (
    <div className={`rounded-3xl border px-5 py-4 ${className}`}>
      <p className="text-micro">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-0.03em] text-foreground">{value}</p>
    </div>
  )
}

function getColumnDescription(column: (typeof REQUIRED_IMPORT_COLUMNS)[number]) {
  switch (column) {
    case "customer_name":
      return "Full client or patient name."
    case "customer_email":
      return "Primary contact email used for reminder delivery."
    case "appointment_title":
      return "Service name or appointment type."
    case "starts_at":
      return "Best supplied as an ISO 8601 date-time string."
    case "timezone":
      return "Client-facing IANA timezone, for example America/New_York."
  }
}

export { CsvImportWorkspace }
