import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BillingInformationService } from './billing-information.service';
import { CreateBillingInformationDto } from './dto/create-billing-information.dto';
import { UpdateBillingInformationDto } from './dto/update-billing-information.dto';
import { AuthGuard } from '../auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('billing-information')
export class BillingInformationController {
  constructor(private readonly billingService: BillingInformationService) {}

  @Post()
  async create(@Body() data: CreateBillingInformationDto) {
    return this.billingService.create(data);
  }

  @Get()
  async findAll() {
    return this.billingService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateBillingInformationDto,
  ) {
    return this.billingService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }
}
