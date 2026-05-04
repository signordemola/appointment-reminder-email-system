import { Controller, Get, Post, Body } from "@nestjs/common";

import {
  parseRequiredString,
  parseOptionalString,
  parseRequiredEmail,
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
}
