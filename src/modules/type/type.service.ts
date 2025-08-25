import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { ProductType } from 'src/schemas/type.schema';

@Injectable()
export class TypeService {
  constructor(
    @InjectModel(ProductType.name)
    private readonly typeModel: Model<ProductType>,
    private readonly subcategoryService: SubcategoryService,
  ) {}

  async create(createTypeDto: CreateTypeDto): Promise<ProductType> {
    await this.subcategoryService.findOne(createTypeDto.subcategory);
    const type = new this.typeModel(createTypeDto);
    return type.save();
  }

  async createMany(createTypeDtos: CreateTypeDto[]): Promise<ProductType[]> {
    // validate each subcategory before saving
    for (const dto of createTypeDtos) {
      await this.subcategoryService.findOne(dto.subcategory);
    }

    // bulk insert
    const docs = createTypeDtos.map((dto) => ({
      ...dto,
      slug: dto.name.toLowerCase().replace(/\s+/g, '-'),
    }));
    const insertedDocs = await this.typeModel.insertMany(docs);
    return insertedDocs.map((doc) => doc.toObject() as ProductType);
  }

  async findAll(): Promise<ProductType[]> {
    return this.typeModel.find().populate('subcategory').exec();
  }

  async findOne(id: string): Promise<ProductType> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const found = await this.typeModel.findById(id).populate('subcategory');

    if (!found) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }

    return found;
  }

  async update(id: string, updateTypeDto: UpdateTypeDto): Promise<ProductType> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID');
    }

    if (updateTypeDto.subcategory) {
      if (!isValidObjectId(updateTypeDto.subcategory)) {
        throw new BadRequestException('Invalid subcategory ID');
      }
      await this.subcategoryService.findOne(updateTypeDto.subcategory);
    }

    if (updateTypeDto.name) {
      updateTypeDto.slug = updateTypeDto.name
        .toLowerCase()
        .replace(/\s+/g, '-');
    }

    const updated = await this.typeModel
      .findByIdAndUpdate(id, updateTypeDto, { new: true })
      .populate('subcategory');

    if (!updated) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID');
    }

    const deleted = await this.typeModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }

    return { message: 'Type deleted successfully' };
  }

  async findBySubcategory(subcategoryId: string): Promise<ProductType[]> {
    if (!isValidObjectId(subcategoryId)) {
      throw new BadRequestException('Invalid subcategory ID');
    }

    return this.typeModel.find({ subcategory: subcategoryId }).exec();
  }
}
