import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '../../schemas/order';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';

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

  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('userId', 'fullName email')
      .populate('products.product', 'productName price imageUrl slug')
      .sort({ createdAt: -1 })
      .exec();
  }

  // New method to find orders by userId
  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId }) // Filter orders by userId
      .populate('userId', 'fullName email')
      .populate('products.product', 'productName price imageUrl slug')
      .sort({ createdAt: -1 })
      .exec();
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
