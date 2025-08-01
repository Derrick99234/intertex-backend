import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Error } from 'mongoose';

@Catch(Error.CastError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: Error.CastError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid ID format',
      error: 'Bad Request',
    });
  }
}
