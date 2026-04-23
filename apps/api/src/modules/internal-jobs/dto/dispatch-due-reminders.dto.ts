import {
  asRecord,
  parseOptionalInteger,
  parseOptionalUuid,
} from "../../../common/validation/request-parsers.js";

export interface DispatchDueRemindersInput {
  limit: number;
  appointmentId?: string | null;
}

export function parseDispatchDueRemindersInput(body: unknown): DispatchDueRemindersInput {
  const payload =
    body === undefined || body === null || body === "" ? {} : asRecord(body, "request body");

  return {
    limit: parseOptionalInteger(payload, "limit", "limit") ?? 10,
    appointmentId: parseOptionalUuid(payload, "appointmentId", "appointmentId"),
  };
}
