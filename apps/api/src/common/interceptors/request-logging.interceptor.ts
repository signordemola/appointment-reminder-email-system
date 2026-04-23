import {
  ConsoleLogger,
  Injectable,
} from "@nestjs/common";
import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";
import type { Observable } from "rxjs";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: ConsoleLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<{
      method?: string;
      url?: string;
    }>();
    const response = httpContext.getResponse<{
      statusCode?: number;
    }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log({
            event: "http.request.completed",
            method: request.method ?? "UNKNOWN",
            path: request.url ?? "/",
            statusCode: response.statusCode ?? 200,
            durationMs: Date.now() - startedAt,
          });
        },
        error: (error: unknown) => {
          this.logger.warn({
            event: "http.request.failed",
            method: request.method ?? "UNKNOWN",
            path: request.url ?? "/",
            statusCode: response.statusCode ?? 500,
            durationMs: Date.now() - startedAt,
            message: error instanceof Error ? error.message : "Request failed",
          });
        },
      }),
    );
  }
}
