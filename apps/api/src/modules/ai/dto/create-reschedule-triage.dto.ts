import { asRecord, parseRequiredUuid } from "../../../common/validation/request-parsers.js";

export interface CreateRescheduleTriageInput {
  rescheduleRequestId: string;
}

export function parseCreateRescheduleTriageInput(body: unknown): CreateRescheduleTriageInput {
  const payload = asRecord(body);

  return {
    rescheduleRequestId: parseRequiredUuid(payload.rescheduleRequestId, "rescheduleRequestId"),
  };
}
