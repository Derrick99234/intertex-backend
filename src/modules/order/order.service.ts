import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from 'src/schemas/order';
import { Cart } from 'src/schemas/cart.schema';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const order = new this.orderModel(createOrderDto);
    const savedOrder = await order.save();

    const itemUpdates = createOrderDto.products.map((item) => {
      return {
        productId: item.productId,
        size: item.size,
      };
    });

    for (const update of itemUpdates) {
      await this.cartService.removeItem(
        createOrderDto.userId,
        update.productId,
        update.size,
      );
    }

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate(
        'products.productId',
        'productName price imageUrl slug offer features process materials description',
      )
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('products.productId', 'name price image');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, {
      new: true,
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Order not found');
  }
}
