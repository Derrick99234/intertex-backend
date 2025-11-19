import { PartialType } from '@nestjs/mapped-types';
import { CreateBillingInformationDto } from './create-billing-information.dto';

export class UpdateBillingInformationDto extends PartialType(
  CreateBillingInformationDto,
) {}
