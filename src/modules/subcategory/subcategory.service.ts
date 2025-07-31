// src/modules/subcategory/subcategory.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Subcategory } from 'src/schemas/subcategory.schema';

@Injectable()
export class SubcategoryService {
  constructor(
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<Subcategory>,
  ) {}

  async create(createDto: CreateSubcategoryDto): Promise<Subcategory> {
    const subcategory = new this.subcategoryModel(createDto);
    return subcategory.save();
  }

  async findAll(): Promise<Subcategory[]> {
    return this.subcategoryModel.find().populate('category').exec();
  }

  async findOne(id: string): Promise<Subcategory> {
    const subcategory = await this.subcategoryModel
      .findById(id)
      .populate('category')
      .exec();

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    return subcategory;
  }

  async update(
    id: string,
    updateDto: UpdateSubcategoryDto,
  ): Promise<Subcategory> {
    const updated = await this.subcategoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Subcategory not found');
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.subcategoryModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Subcategory not found');
    }

    return { message: 'Subcategory deleted successfully' };
  }

  // Optional: Get all subcategories under a specific category
  async findByCategory(categoryId: string): Promise<Subcategory[]> {
    return this.subcategoryModel.find({ category: categoryId }).exec();
  }
}
