import "reflect-metadata";
import "dotenv/config";

import { ConsoleLogger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor.js";

async function bootstrap() {
  const logger = new ConsoleLogger({
    context: "Bootstrap",
    json: true,
  });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger,
    rawBody: true,
  });

  const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalInterceptors(new RequestLoggingInterceptor(logger));

  const rawPort = (process.env.PORT ?? "").trim();
  const parsedPort = rawPort.length > 0 ? Number(rawPort) : Number.NaN;
  const port =
    Number.isFinite(parsedPort) && parsedPort >= 0 && parsedPort <= 65535 ? parsedPort : 4000;

  await app.listen(port);
  logger.log({
    event: "server.started",
    port,
    baseUrl: `http://localhost:${port}`,
  });
}

bootstrap().catch((error) => {
  const logger = new ConsoleLogger({
    context: "Bootstrap",
    json: true,
  });
  logger.error(
    {
      event: "server.start.failed",
      message: error instanceof Error ? error.message : "Unknown startup error",
    },
    error instanceof Error ? error.stack : undefined,
  );
  process.exit(1);
});
