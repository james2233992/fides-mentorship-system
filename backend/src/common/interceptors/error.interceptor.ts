import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        
        // Log the error
        this.logger.error(
          `Error occurred: ${error.message}`,
          error.stack,
          `${request.method} ${request.url}`,
        );

        // Handle different error types
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Handle Prisma errors
        if (error.code === 'P2002') {
          return throwError(() => 
            new HttpException(
              'A record with this information already exists',
              HttpStatus.CONFLICT,
            ),
          );
        }

        if (error.code === 'P2025') {
          return throwError(() => 
            new HttpException(
              'Record not found',
              HttpStatus.NOT_FOUND,
            ),
          );
        }

        // Default error
        return throwError(() => 
          new HttpException(
            'An unexpected error occurred',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }),
    );
  }
}