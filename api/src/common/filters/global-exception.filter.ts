import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const isDev = (this.configService.get<string>('NODE_ENV') ?? 'dev') === 'dev';

    const responseBody = isHttpException ? exception.getResponse() : null;
    const message =
      typeof responseBody === 'string'
        ? responseBody
        : (responseBody as { message?: string | string[] })?.message ??
          'Internal server error';


    const payload: Record<string, unknown> = {
      statusCode,
      message,
    };

    if (isDev) {
      payload.trace =
        exception instanceof Error ? (exception.stack ?? exception.message) : String(exception);
    }

    response.status(statusCode).json(payload);
  }
}
