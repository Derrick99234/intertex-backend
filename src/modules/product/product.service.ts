import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TypeService } from '../type/type.service';
import { Product } from 'src/schemas/product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly typeService: TypeService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    imageUrl: any,
    otherImages: any,
  ): Promise<Product> {
    const { productType } = createProductDto;
    await this.typeService.findOne(productType);

    const newProduct = new this.productModel({
      ...createProductDto,
      imageUrl,
      otherImages,
    });
    return await newProduct.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().populate('productType');
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('productType');

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    imageUrl: any,
    otherImages: any,
  ): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(
        id,
        { ...updateProductDto, imageUrl, otherImages },
        { new: true },
      )
      .populate('productType');

    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const deleted = await this.productModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return { message: 'Product deleted successfully' };
  }
}
