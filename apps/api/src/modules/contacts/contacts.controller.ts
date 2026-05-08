import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from "@nestjs/common";

import {
  parseRequiredString,
  parseOptionalString,
  parseRequiredEmail,
  parseRequiredUuid,
} from "../../common/validation/request-parsers.js";
import { ContactsService } from "./contacts.service.js";

function parseCreateContactInput(body: unknown) {
  const payload = body as Record<string, unknown>;
  return {
    fullName: parseRequiredString(payload, "fullName", { minLength: 1, maxLength: 200 }),
    email: parseRequiredEmail(payload, "email"),
    phone: parseOptionalString(payload, "phone", { maxLength: 50 }) ?? null,
    timezone: parseRequiredString(payload, "timezone", { maxLength: 100 }),
    emailOptOut: payload["emailOptOut"] === true,
  };
}

function parseUpdateContactInput(body: unknown) {
  const payload = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  if (payload["fullName"] !== undefined) data.fullName = parseRequiredString(payload, "fullName", { minLength: 1, maxLength: 200 });
  if (payload["email"] !== undefined) data.email = parseRequiredEmail(payload, "email");
  if (payload["phone"] !== undefined) data.phone = parseOptionalString(payload, "phone", { maxLength: 50 }) ?? null;
  if (payload["timezone"] !== undefined) data.timezone = parseRequiredString(payload, "timezone", { maxLength: 100 });
  if (payload["emailOptOut"] !== undefined) data.emailOptOut = payload["emailOptOut"] === true;
  return data;
}

@Controller("contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Post()
  create(@Body() body: unknown) {
    return this.contactsService.create(parseCreateContactInput(body));
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.contactsService.update(
      parseRequiredUuid(id, "contactId"),
      parseUpdateContactInput(body),
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param("id") id: string) {
    return this.contactsService.softDelete(
      parseRequiredUuid(id, "contactId"),
    );
  }
}
