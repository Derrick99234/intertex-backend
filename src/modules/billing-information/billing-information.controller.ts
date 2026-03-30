import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BillingInformationService } from './billing-information.service';
import { CreateBillingInformationDto } from './dto/create-billing-information.dto';
import { UpdateBillingInformationDto } from './dto/update-billing-information.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';

@UseGuards(AuthGuard)
@Controller('billing-information')
export class BillingInformationController {
  constructor(private readonly billingService: BillingInformationService) {}

  @Post()
  async create(
    @AuthUser() authUser: any,
    @Body() data: CreateBillingInformationDto,
  ) {
    return this.billingService.create(authUser.userId, data);
  }

  @Get()
  async findAll(@AuthUser() authUser: any) {
    return this.billingService.findAll(authUser.userId);
  }

  @Put(':id')
  async replace(
    @Param('id') id: string,
    @AuthUser() authUser: any,
    @Body() data: UpdateBillingInformationDto,
  ) {
    return this.billingService.update(authUser.userId, id, data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @AuthUser() authUser: any,
    @Body() data: UpdateBillingInformationDto,
  ) {
    return this.billingService.update(authUser.userId, id, data);
  }
}
