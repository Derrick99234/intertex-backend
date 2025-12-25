import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { TypeService } from '../type/type.service';
import { Product } from '../../schemas/product.schema';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { CategoryService } from '../category/category.service';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Inject(forwardRef(() => TypeService))
    private readonly typeService: TypeService,
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService,
  ) {}

  private s3 = new S3Client({
    region: 'eu-north-1', // Change to your region
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  private extractKeyFromUrl(url: string): string {
    console.log('URL received:', url); // Log the URL for debugging
    try {
      const urlObj = new URL(url); // Try to parse the URL
      return decodeURIComponent(urlObj.pathname.substring(1)); // Remove leading "/"
    } catch (error) {
      console.error('Error parsing URL:', error);
      throw new Error('Invalid URL provided');
    }
  }

  async deleteFileFromUrl(url: string): Promise<void> {
    const Bucket = 'intertex-storage'; // Your bucket name
    const Key = this.extractKeyFromUrl(url);

    try {
      // Send delete command to AWS S3
      await this.s3.send(new DeleteObjectCommand({ Bucket, Key }));
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  async deleteFilesFromUrls(urls: string | string[]): Promise<void> {
    // If it's a single URL string, convert it to an array
    const urlArray = Array.isArray(urls) ? urls : [urls];

    // Loop over each URL and delete it
    for (const url of urlArray) {
      await this.deleteFileFromUrl(url);
    }
  }

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

  async countProductsByProductType() {
    try {
      // Run aggregation to group products by productType and count them
      const productCountByType = await this.productModel.aggregate([
        {
          $group: {
            _id: '$productType', // Group by the productType field
            count: { $sum: 1 }, // Count how many products belong to each productType
          },
        },
      ]);

      return productCountByType;
    } catch (error) {
      throw new Error('Could not count products by product type.');
    }
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
    newImages: any,
  ): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updated = await this.productModel
      .findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          otherImages: [...(newImages || []), ...product.otherImages],
        },
        { new: true },
      )
      .populate('productType');

    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (
      updateProductDto.deleteImages &&
      updateProductDto.deleteImages.length > 0
    ) {
      updated.otherImages = updated.otherImages.filter(
        (img) => !updateProductDto.deleteImages.includes(img),
      );

      // Call AWS S3 to delete the images from the bucket
      const res = await this.deleteFilesFromUrls(updateProductDto.deleteImages);

      await updated.save();
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

  async searchProducts(
    keyword: string,
    filters?: {
      categorySlug?: string;
      subcategorySlug?: string;
      productTypeSlug?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ): Promise<Product[]> {
    // Case-insensitive partial match for keyword
    const keywordRegex =
      keyword && keyword.trim().length > 0
        ? new RegExp(keyword.trim(), 'i')
        : /.*/;

    // Base query
    const filterQuery: any = {
      $or: [{ productName: keywordRegex }, { description: keywordRegex }],
    };

    // ✅ Category filter
    if (filters?.categorySlug && filters.categorySlug.trim()) {
      const category = await this.categoryService.findOneBySlug(
        filters.categorySlug,
      );
      if (category?._id) {
        const subcategories = await this.subcategoryService.findByCategory(
          category._id as unknown as string,
        );
        const subcategoryIds = subcategories.map((sub) => sub._id);
        filterQuery.subcategory = { $in: subcategoryIds };
      }
    }

    // ✅ Subcategory filter
    if (filters?.subcategorySlug && filters.subcategorySlug.trim()) {
      const subcategory = await this.subcategoryService.findOneBySlug(
        filters.subcategorySlug,
      );
      if (!subcategory) {
        throw new NotFoundException(
          `Subcategory with slug "${filters.subcategorySlug}" not found`,
        );
      }
      filterQuery.subcategory = subcategory._id;
    }

    // ✅ Product type filter
    if (filters?.productTypeSlug && filters.productTypeSlug.trim()) {
      const productType = await this.typeService.findOneBySlug(
        filters.productTypeSlug,
      );
      if (!productType) {
        throw new NotFoundException(
          `Product type with slug "${filters.productTypeSlug}" not found`,
        );
      }
      filterQuery.productType = productType._id;
    }

    // ✅ Price range filter
    const minPriceValid =
      filters?.minPrice !== undefined && !isNaN(filters.minPrice);
    const maxPriceValid =
      filters?.maxPrice !== undefined && !isNaN(filters.maxPrice);

    if (minPriceValid || maxPriceValid) {
      filterQuery.price = {};
      if (minPriceValid) filterQuery.price.$gte = filters!.minPrice;
      if (maxPriceValid) filterQuery.price.$lte = filters!.maxPrice;
    }

    // 🧠 Debugging logs

    // Fetch results
    const results = await this.productModel
      .find(filterQuery)
      .populate({
        path: 'subcategory',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name slug',
        },
      })
      .populate('productType');

    return results;
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
      category._id as unknown as string,
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
      category._id.toString(),
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
