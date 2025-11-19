import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { CategoryService } from '../category/category.service';
import { ProductService } from '../product/product.service';
import { OrdersService } from '../order/order.service';
import { ProductType } from '../../schemas/type.schema';

@Injectable()
export class TypeService {
  constructor(
    @InjectModel(ProductType.name)
    private typeModel: Model<ProductType>,
    private categoryService: CategoryService,
    private productService: ProductService,
    private subcategoryService: SubcategoryService,
    private orderService: OrdersService,
  ) {}

  async updateTotalProducts() {
    try {
      // Step 1: Get the product count by product type from the service
      const productCountByType =
        await this.productService.countProductsByProductType();

      // Step 2: Get all product types
      const allProductTypes = await this.typeModel.find();

      // Step 3: Loop through all product types
      for (const productType of allProductTypes) {
        // Step 4: Find the corresponding product type count from the aggregation result
        const matchingProductTypeCount = productCountByType.find(
          (item) => item._id.toString() === productType._id.toString(),
        );

        // If no matching count is found, set totalProducts to 0
        const totalProducts = matchingProductTypeCount
          ? matchingProductTypeCount.count
          : 0;

        // Step 5: Update the product type with the total product count
        await this.typeModel.findByIdAndUpdate(
          productType._id, // Update by the productType ID
          { totalProducts }, // Set totalProducts to the count (or 0 if not found)
          { new: true }, // Return the updated document
        );
      }
    } catch (error) {
      console.error('Error updating total products in ProductType:', error);
    }
  }

  async updateTotalSold() {
    try {
      // Step 1: Get all successful orders and populate productId
      const successfulOrders = (await this.orderService.findAll())
        .filter((order) => order.status === 'successful')
        .map((order) => {
          // Ensure productId is converted to ObjectId only if it's not already an ObjectId
          order.products = order.products.map((productItem) => {
            const productId = productItem.productId;
            if (
              productId &&
              typeof productId === 'string' &&
              !Types.ObjectId.isValid(productId)
            ) {
              // Handle case where productId is an invalid string, log and skip or handle error.

              return productItem; // Skip or handle invalid productId
            }
            return {
              ...productItem,
              productId: Types.ObjectId.isValid(productId)
                ? new Types.ObjectId(productId)
                : productId,
            };
          });
          return order;
        });

      // Step 3: Loop through all successful orders
      let totalSold = 0;
      for (const order of successfulOrders) {
        // Step 4: Loop through each product in the order
        for (const productItem of order.products) {
          const productId = productItem.productId;

          // Step 5: Ensure productId is a valid ObjectId before querying Product
          if (!Types.ObjectId.isValid(productId)) {
            continue; // Skip invalid productId
          }

          const product = await this.productService.findOne(String(productId));

          if (product && product.productType) {
            const productTypeId = product.productType._id; // Assuming `productType` is stored in the Product schema

            // Step 6: Find the corresponding product type
            const productType = await this.typeModel.findById(productTypeId);

            if (productType) {
              // Step 7: Update totalSold by adding the quantity of the current product sold
              totalSold += productItem.quantity;

              // Step 8: Update the product type with the new totalSold value
              await this.typeModel.findByIdAndUpdate(
                productTypeId, // Update by productType ID
                { totalSold }, // Set new totalSold value
                { new: true }, // Return the updated document
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating total sold in ProductType:', error);
    }
  }

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
    return this.typeModel
      .find()
      .populate({
        path: 'subcategory',
        populate: { path: 'category', select: 'name slug' },
      })
      .exec();
  }

  async findOneBySlug(slug: string): Promise<ProductType> {
    const type = await this.typeModel
      .findOne({ slug })
      .populate('subcategory')
      .exec();
    if (!type) {
      throw new NotFoundException(`Type with slug ${slug} not found`);
    }
    return type;
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

  async findProductCategory(subcategoryId: string) {
    const subcategory = await this.subcategoryService.findOne(subcategoryId);
    const categoryId = subcategory.category;
    const category = await this.categoryService.findOne(categoryId.toString());
    return {
      categoryId: category._id,
      categoryName: category.name,
      subcategoryId: subcategory._id,
      subcategoryName: subcategory.name,
    };
  }

  async findBySubcategory(subcategoryId: string): Promise<ProductType[]> {
    if (!isValidObjectId(subcategoryId)) {
      throw new BadRequestException('Invalid subcategory ID');
    }

    return this.typeModel.find({ subcategory: subcategoryId }).exec();
  }
}
