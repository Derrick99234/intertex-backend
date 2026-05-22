import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '../../schemas/order';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { PaginationQuery, parsePagination, paginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
    private productService: ProductService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const products = await Promise.all(
      createOrderDto.products.map(async (item) => {
        const product = await this.productService.findOne(item.product);
        return {
          product: product._id,
          productName: item.productName || product.productName,
          quantity: item.quantity,
          size: item.size,
        };
      }),
    );

    const order = new this.orderModel({
      ...createOrderDto,
      userId,
      products,
    });
    const savedOrder = await order.save();

    for (const update of products) {
      await this.cartService.removeItem(
        userId,
        update.product.toString(),
        update.size,
      );
    }

    return this.findOne(savedOrder._id.toString());
  }

  async findAll(query: PaginationQuery = {}) {
    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      this.orderModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email')
        .populate('products.product', 'productName price imageUrl slug')
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments(),
    ]);
    return paginatedResult(data, total, page, limit);
  }

  async findAllByUser(userId: string, query: PaginationQuery = {}) {
    const { page, limit, skip } = parsePagination(query);
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ userId })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email')
        .populate('products.product', 'productName price imageUrl slug')
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments({ userId }),
    ]);
    return paginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'fullName email')
      .populate('products.product', 'productName price imageUrl slug');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, {
      new: true,
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.findOne(order._id.toString());
  }
}
