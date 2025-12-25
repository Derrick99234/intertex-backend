import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BillingInformation } from '../../schemas/billing-information.schema';
import { CreateBillingInformationDto } from './dto/create-billing-information.dto';
import { UpdateBillingInformationDto } from './dto/update-billing-information.dto';

@Injectable()
export class BillingInformationService {
  constructor(
    @InjectModel(BillingInformation.name)
    private readonly billingModel: Model<BillingInformation>,
  ) {}

  async create(data: CreateBillingInformationDto) {
    if (data.isDefault === true) {
      await this.billingModel.updateMany(
        {
          user: data.user,
        },
        {
          $set: { isDefault: false },
        },
      );
    }

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
    // If this address is being set as default
    if (data.isDefault === true) {
      const billing = await this.billingModel.findById(id).exec();

      if (!billing) {
        throw new NotFoundException(`Billing info with ID ${id} not found`);
      }

      // Remove default from all other addresses of this user
      await this.billingModel.updateMany(
        {
          user: billing.user,
          _id: { $ne: id },
        },
        { isDefault: false },
      );
    }

    // Update the selected address
    const updatedBilling = await this.billingModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updatedBilling) {
      throw new NotFoundException(`Billing info with ID ${id} not found`);
    }

    return updatedBilling;
  }

  async remove(id: string) {
    const billing = await this.billingModel.findByIdAndDelete(id).exec();
    if (!billing)
      throw new NotFoundException(`Billing info with ID ${id} not found`);
    return { message: 'Billing info deleted successfully' };
  }
}
