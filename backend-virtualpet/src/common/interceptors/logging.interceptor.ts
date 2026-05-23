import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} ${res.statusCode} +${ms}ms`);
      }),
      catchError((err: unknown) => {
        const ms = Date.now() - start;
        const status = (err as { status?: number }).status ?? 500;
        const message = (err as { message?: string }).message ?? 'Unknown error';
        this.logger.error(`${method} ${url} ${status} +${ms}ms — ${message}`);
        return throwError(() => err);
      }),
    );
  }
}
