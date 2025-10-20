import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TypeService } from '../type/type.service';
import { Product } from 'src/schemas/product.schema';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { CategoryService } from '../category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly typeService: TypeService,
    private readonly subcategoryService: SubcategoryService,
    private readonly categoryService: CategoryService,
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
    const product = await newProduct.save();

    const populatedProduct = await product.populate([
      {
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      },
      { path: 'productType' },
    ]);

    return populatedProduct;
  }

  async findAll(): Promise<Product[]> {
    return this.productModel
      .find()
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          select: 'name slug',
        },
      })
      .populate('productType')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          select: 'name slug',
        },
      })
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

  async searchProducts(keyword: string): Promise<Product[]> {
    const regex = new RegExp(keyword, 'i'); // Case-insensitive regex for partial match
    return this.productModel
      .find({
        $or: [{ name: regex }, { description: regex }],
      })
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      })
      .populate('productType');
  }

  async fetchLatestProducts(limit: number): Promise<Product[]> {
    return this.productModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      })
      .populate('productType');
  }

  async fetchProductsByCategory(slug: string): Promise<Product[]> {
    const category = await this.categoryService.findOneBySlug(slug);
    const subcategories = await this.subcategoryService.findByCategory(
      category._id as string,
    );
    const subcategoryIds = subcategories.map((sub) => sub._id);

    return this.productModel
      .find({ subcategory: { $in: subcategoryIds } })
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      })
      .populate('productType');
  }

  async fetchProductsByType(slug: string): Promise<Product[]> {
    const type = await this.typeService.findOneBySlug(slug);
    return this.productModel
      .find({ productType: type._id })
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      })
      .populate('productType');
  }

  async fetchProductsBySubcategory(
    categorySlug: string,
    subcategorySlug: string,
  ): Promise<Product[]> {
    const category = await this.categoryService.findOneBySlug(categorySlug);
    const subcategories = await this.subcategoryService.findByCategory(
      category._id as string,
    );
    const subcategoryIds = subcategories.map((sub) => sub._id.toString());

    const subcategory = subcategories.find(
      (sub) => sub.slug === subcategorySlug,
    );

    if (!subcategoryIds.includes(subcategory._id.toString())) {
      throw new NotFoundException(
        `Subcategory with slug ${subcategorySlug} not found under category ${categorySlug}`,
      );
    }
    return this.productModel
      .find({ subcategory: subcategory._id })
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      })
      .populate('productType');
  }

  async fetchProductBySlug(slug: string): Promise<Product | null> {
    return this.productModel
      .findOne({ slug })
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      })
      .populate('productType');
  }
}
