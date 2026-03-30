import { BadRequestException, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function validateDto<T extends object>(
  cls: Type<T>,
  payload: Record<string, any>,
): Promise<T> {
  const dto = plainToInstance(cls, payload);
  const errors = await validate(dto as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    const constraints = errors
      .flatMap((error) => Object.values(error.constraints || {}))
      .filter(Boolean);

    throw new BadRequestException(
      constraints[0] || 'Request validation failed',
    );
  }

  return dto;
}
