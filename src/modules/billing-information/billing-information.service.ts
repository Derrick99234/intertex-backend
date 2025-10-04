// src/billing-information/billing-information.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BillingInformation } from 'src/schemas/billing-information.schema';
import { CreateBillingInformationDto } from './dto/create-billing-information.dto';
import { UpdateBillingInformationDto } from './dto/update-billing-information.dto';

@Injectable()
export class BillingInformationService {
  constructor(
    @InjectModel(BillingInformation.name)
    private readonly billingModel: Model<BillingInformation>,
  ) {}

  async create(data: CreateBillingInformationDto) {
    const billing = new this.billingModel(data);
    return billing.save();
  }

  async findAll() {
    return this.billingModel.find().populate('user', 'email fullName').exec();
  }

  async findOne(id: string) {
    const billing = await this.billingModel
      .findById(new Types.ObjectId(id))
      .populate('user', 'email fullName')
      .exec();

    if (!billing)
      throw new NotFoundException(`Billing info with ID ${id} not found`);
    return billing;
  }

  async update(id: string, data: UpdateBillingInformationDto) {
    const billing = await this.billingModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!billing)
      throw new NotFoundException(`Billing info with ID ${id} not found`);
    return billing;
  }

  async remove(id: string) {
    const billing = await this.billingModel.findByIdAndDelete(id).exec();
    if (!billing)
      throw new NotFoundException(`Billing info with ID ${id} not found`);
    return { message: 'Billing info deleted successfully' };
  }
}
