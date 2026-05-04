import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfTodayUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const startOfTomorrowUtc = new Date(startOfTodayUtc.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysAgoUtc = new Date(startOfTodayUtc.getTime() - 6 * 24 * 60 * 60 * 1000);

    const [
      appointmentsToday,
      confirmedAppointments,
      pendingConfirmations,
      rescheduleRequests,
      canceledAppointments,
      noShows,
      remindersSentToday,
      deliveryFailures,
      bounceCount,
      reminderActivityRows,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          startsAtUtc: {
            gte: startOfTodayUtc,
            lt: startOfTomorrowUtc,
          },
        },
      }),
      this.prisma.appointment.count({
        where: {
          confirmationStatus: "confirmed",
        },
      }),
      this.prisma.appointment.count({
        where: {
          confirmationStatus: "pending",
          status: {
            in: ["scheduled", "reschedule_requested"],
          },
        },
      }),
      this.prisma.rescheduleRequest.count({
        where: {
          status: "pending",
        },
      }),
      this.prisma.appointment.count({
        where: {
          status: "canceled",
        },
      }),
      this.prisma.appointment.count({
        where: {
          status: "no_show",
        },
      }),
      this.prisma.reminderEvent.count({
        where: {
          processedAt: {
            gte: startOfTodayUtc,
            lt: startOfTomorrowUtc,
          },
          status: {
            in: ["sent", "delivered", "opened", "clicked"],
          },
        },
      }),
      this.prisma.reminderEvent.count({
        where: {
          processedAt: {
            gte: startOfTodayUtc,
            lt: startOfTomorrowUtc,
          },
          status: "failed",
        },
      }),
      this.prisma.reminderEvent.count({
        where: {
          processedAt: {
            gte: startOfTodayUtc,
            lt: startOfTomorrowUtc,
          },
          status: "bounced",
        },
      }),
      this.prisma.$queryRaw<
        Array<{
          day: Date;
          sent_count: bigint | number;
          failed_count: bigint | number;
          bounced_count: bigint | number;
        }>
      >`
        SELECT
          date_trunc('day', "processedAt") AS day,
          COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'opened', 'clicked')) AS sent_count,
          COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
          COUNT(*) FILTER (WHERE status = 'bounced') AS bounced_count
        FROM "ReminderEvent"
        WHERE "processedAt" >= ${sevenDaysAgoUtc}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

    const activityLookup = new Map(
      reminderActivityRows.map((row) => [
        row.day.toISOString().slice(0, 10),
        {
          sent: Number(row.sent_count),
          failed: Number(row.failed_count),
          bounced: Number(row.bounced_count),
        },
      ]),
    );

    const reminderActivity = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(sevenDaysAgoUtc.getTime() + index * 24 * 60 * 60 * 1000);
      const key = day.toISOString().slice(0, 10);
      const values = activityLookup.get(key);

      return {
        day: key,
        sent: values?.sent ?? 0,
        failed: values?.failed ?? 0,
        bounced: values?.bounced ?? 0,
      };
    });

    const upcomingToday = await this.prisma.appointment.findMany({
      where: {
        startsAtUtc: {
          gte: startOfTodayUtc,
          lt: startOfTomorrowUtc,
        },
      },
      include: { contact: true },
      orderBy: { startsAtUtc: "asc" },
    });

    const recentEvents = await this.prisma.reminderEvent.findMany({
      where: {
        processedAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
        status: {
          in: ["sent", "delivered", "opened", "clicked", "failed", "bounced"],
        },
      },
      include: { appointment: { include: { contact: true } } },
      orderBy: { processedAt: "desc" },
      take: 10,
    });

    const weeklyAppointmentRows = await this.prisma.$queryRaw<
      Array<{
        day: Date;
        scheduled: bigint | number;
        confirmed: bigint | number;
        cancelled: bigint | number;
        no_show: bigint | number;
        reschedule_requested: bigint | number;
      }>
    >`
      SELECT
        date_trunc('day', "startsAtUtc") AS day,
        COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'canceled') AS cancelled,
        COUNT(*) FILTER (WHERE status = 'no_show') AS no_show,
        COUNT(*) FILTER (WHERE status = 'reschedule_requested') AS reschedule_requested
      FROM "Appointment"
      WHERE "startsAtUtc" >= ${sevenDaysAgoUtc}
        AND "startsAtUtc" < ${startOfTomorrowUtc}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const weeklyLookup = new Map(
      weeklyAppointmentRows.map((row) => [
        row.day.toISOString().slice(0, 10),
        {
          scheduled: Number(row.scheduled),
          confirmed: Number(row.confirmed),
          cancelled: Number(row.cancelled),
          noShow: Number(row.no_show),
          rescheduleRequested: Number(row.reschedule_requested),
        },
      ]),
    );

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyBreakdown = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(sevenDaysAgoUtc.getTime() + index * 24 * 60 * 60 * 1000);
      const key = day.toISOString().slice(0, 10);
      const values = weeklyLookup.get(key);

      return {
        day: dayNames[day.getDay()],
        confirmed: values?.confirmed ?? 0,
        pending: (values?.scheduled ?? 0) + (values?.rescheduleRequested ?? 0),
        cancelled: values?.cancelled ?? 0,
        noShow: values?.noShow ?? 0,
      };
    });

    return {
      generatedAt: now.toISOString(),
      metrics: {
        appointmentsToday,
        confirmedAppointments,
        pendingConfirmations,
        rescheduleRequests,
        canceledAppointments,
        noShows,
        remindersSentToday,
        deliveryFailures,
        bounceCount,
      },
      reminderActivity,
      upcomingToday,
      recentEvents,
      weeklyBreakdown,
    };
  }
}
