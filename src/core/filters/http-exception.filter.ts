import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resPayload = exception.getResponse();
      
      if (typeof resPayload === 'object' && resPayload !== null) {
        message = (resPayload as any).message || exception.message;
        error = (resPayload as any).error || exception.name;
      } else {
        message = exception.message;
      }
    } else {
      // Log uncaught raw runtime or database trace logs safely on the server side
      this.logger.error(
        `Uncaught Exception: ${exception instanceof Error ? exception.message : exception}`,
        exception instanceof Error ? exception.stack : '',
      );
      
      // Ensure we NEVER leak database queries, TypeORM trace sheets, etc. to clients
      message = 'An unexpected error occurred. Please try again later.';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
