import { Injectable } from "@nestjs/common";

import { Prisma } from "../../generated/prisma/client.js";
import { PrismaService } from "../../prisma/prisma.service.js";

type DatabaseClient = PrismaService | Prisma.TransactionClient;

export type UpsertContactInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  contactTimezone: string;
  emailOptOut: boolean;
};

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertAppointmentContact(executor: DatabaseClient, input: UpsertContactInput) {
    const existingContact = await executor.contact.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!existingContact) {
      return executor.contact.create({
        data: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone ?? null,
          timezone: input.contactTimezone,
          emailOptOut: input.emailOptOut,
        },
      });
    }

    return executor.contact.update({
      where: {
        id: existingContact.id,
      },
      data: {
        fullName: input.fullName,
        timezone: input.contactTimezone,
        emailOptOut: input.emailOptOut,
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
      },
    });
  }

  findById(contactId: string) {
    return this.prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });
  }

  async findAll() {
    const contacts = await this.prisma.contact.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        fullName: "asc",
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
        appointments: {
          select: {
            startsAtUtc: true,
          },
          orderBy: {
            startsAtUtc: "desc",
          },
          take: 1,
        },
      },
    });

    return contacts.map((contact) => ({
      ...contact,
      totalAppointments: contact._count.appointments,
      lastAppointmentAt: contact.appointments[0]?.startsAtUtc?.toISOString() ?? null,
      _count: undefined,
      appointments: undefined,
    }));
  }

  create(input: {
    fullName: string;
    email: string;
    phone?: string | null;
    timezone: string;
    emailOptOut: boolean;
  }) {
    return this.prisma.contact.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        timezone: input.timezone,
        emailOptOut: input.emailOptOut,
      },
    });
  }

  update(
    contactId: string,
    input: {
      fullName?: string;
      email?: string;
      phone?: string | null;
      timezone?: string;
      emailOptOut?: boolean;
    },
  ) {
    return this.prisma.contact.update({
      where: { id: contactId },
      data: input,
    });
  }

  softDelete(contactId: string) {
    return this.prisma.contact.update({
      where: { id: contactId },
      data: { deletedAt: new Date() },
    });
  }
}
