import { createPrismaClient } from "../src/lib/prisma.js";

const prisma = createPrismaClient();

async function main() {
  const rules = [
    {
      name: "Immediate confirmation request",
      eventType: "confirmation_request" as const,
      offsetMinutes: 0,
    },
    {
      name: "24 hour reminder",
      eventType: "reminder" as const,
      offsetMinutes: -1440,
    },
    {
      name: "1 hour reminder",
      eventType: "reminder" as const,
      offsetMinutes: -60,
    },
  ];

  for (const rule of rules) {
    await prisma.reminderRule.upsert({
      where: {
        name: rule.name,
      },
      update: {
        active: true,
        eventType: rule.eventType,
        offsetMinutes: rule.offsetMinutes,
      },
      create: {
        name: rule.name,
        eventType: rule.eventType,
        offsetMinutes: rule.offsetMinutes,
      },
    });
  }

  console.log(`Seeded ${rules.length} reminder rules.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
