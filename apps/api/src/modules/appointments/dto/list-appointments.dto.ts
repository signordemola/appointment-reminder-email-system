import {
  parseQueryEnum,
  parseQueryInteger,
  parseQueryString,
} from "../../../common/validation/request-parsers.js";
import {
  APPOINTMENT_STATUSES,
  CONFIRMATION_STATUSES,
} from "../../../common/utils/domain-constants.js";

export interface ListAppointmentsQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: (typeof APPOINTMENT_STATUSES)[number];
  confirmationStatus?: (typeof CONFIRMATION_STATUSES)[number];
}

export function parseListAppointmentsQuery(query: Record<string, unknown>): ListAppointmentsQuery {
  return {
    page: parseQueryInteger(query.page, "page", 1, 1, 10_000),
    pageSize: parseQueryInteger(query.pageSize, "pageSize", 20, 1, 100),
    search: parseQueryString(query.search, "search", {
      maxLength: 120,
    }),
    status: parseQueryEnum(query.status, "status", APPOINTMENT_STATUSES),
    confirmationStatus: parseQueryEnum(
      query.confirmationStatus,
      "confirmationStatus",
      CONFIRMATION_STATUSES,
    ),
  };
}
