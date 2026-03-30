import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BillingInformation } from '../../schemas/billing-information.schema';
import { CreateBillingInformationDto } from './dto/create-billing-information.dto';
import { UpdateBillingInformationDto } from './dto/update-billing-information.dto';

@Injectable()
export class BillingInformationService {
  constructor(
    @InjectModel(BillingInformation.name)
    private readonly billingModel: Model<BillingInformation>,
  ) {}

  async create(userId: string, data: CreateBillingInformationDto) {
    if (data.isDefault === true) {
      await this.billingModel.updateMany(
        {
          user: userId,
        },
        {
          $set: { isDefault: false },
        },
      );
    }

    const billing = new this.billingModel({ ...data, user: userId });
    return billing.save();
  }

  async findAll(userId: string) {
    return this.billingModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(userId: string, id: string, data: UpdateBillingInformationDto) {
    // If this address is being set as default
    if (data.isDefault === true) {
      const billing = await this.billingModel.findOne({ _id: id, user: userId }).exec();

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
      .findOneAndUpdate({ _id: id, user: userId }, data, { new: true })
      .exec();

    if (!updatedBilling) {
      throw new NotFoundException(`Billing info with ID ${id} not found`);
    }

    return updatedBilling;
  }
}
