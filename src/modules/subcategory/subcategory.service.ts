import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Subcategory } from '../../schemas/subcategory.schema';
import { CategoryService } from '../category/category.service';

@Injectable()
export class SubcategoryService {
  constructor(
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<Subcategory>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(createDto: CreateSubcategoryDto): Promise<Subcategory> {
    await this.categoryService.findOne(createDto.category);
    const subcategory = new this.subcategoryModel(createDto);
    return subcategory.save();
  }

  async findAll(): Promise<Subcategory[]> {
    return this.subcategoryModel.find().populate('category').exec();
  }

  async findOneBySlug(slug: string): Promise<Subcategory> {
    const subcategory = await this.subcategoryModel
      .findOne({ slug })
      .populate('category')
      .exec();
    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }
    return subcategory;
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
    if (updateDto.category) {
      await this.categoryService.findOne(updateDto.category);
    }

    if (updateDto.name) {
      updateDto.slug = updateDto.name.toLowerCase().replace(/\s+/g, '-');
    }

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
