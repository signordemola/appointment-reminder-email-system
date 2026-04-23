import { Catch, ConsoleLogger, HttpException } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: ConsoleLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<{
      method?: string;
      url?: string;
    }>();
    const response = context.getResponse<{
      status: (statusCode: number) => { json: (body: unknown) => void };
    }>();

    let statusCode = 500;
    let responseBody: Record<string, unknown> = {
      message: "Internal server error",
      error: "Internal Server Error",
    };

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        responseBody = {
          message: exceptionResponse,
          error: exception.name,
        };
      } else if (exceptionResponse && typeof exceptionResponse === "object") {
        responseBody = {
          ...(exceptionResponse as Record<string, unknown>),
        };
      }
    }

    const logPayload = {
      event: "http.exception",
      method: request.method ?? "UNKNOWN",
      path: request.url ?? "UNKNOWN",
      statusCode,
      message:
        exception instanceof Error ? exception.message : responseBody.message ?? "Unknown exception",
    };

    if (statusCode >= 500) {
      this.logger.error(logPayload, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(logPayload);
    }

    response.status(statusCode).json({
      ...responseBody,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url ?? "/",
    });
  }
}
