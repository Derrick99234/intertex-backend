import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const created = new this.categoryModel(createCategoryDto);
    return created.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findOneBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (updateCategoryDto.name) {
      updateCategoryDto.slug = updateCategoryDto.name
        .toLowerCase()
        .replace(/\s+/g, '-');
    }

    const updated = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      {
        new: true,
      },
    );

    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return { message: `Category with ID ${id} was successfully deleted.` };
  }
}
