// src/cart/cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from 'src/schemas/cart.schema';
import { AddToCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price images slug',
    });

    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }

    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getCart(userId);
    const existingItem = cart.items.find(
      (item) =>
        item.product._id.toString() === dto.product && item.size === dto.size,
    );

    if (existingItem) {
      existingItem.quantity += dto.quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(dto.product),
        size: dto.size,
        quantity: dto.quantity,
      });
    }

    const savedCart = await cart.save();
    return savedCart.populate({
      path: 'items.product',
      select: 'name price images slug', // only keep these fields
    });
  }

  async updateItem(userId: string, dto: UpdateCartDto) {
    const cart = await this.getCart(userId);

    const item = cart.items.find(
      (i) => i.product._id.toString() === dto.product && i.size === dto.size,
    );

    if (!item)
      throw new NotFoundException('Product with size not found in cart');

    item.quantity = dto.quantity;

    return cart.save();
  }

  async removeItem(userId: string, productId: string, size: string) {
    const cart = await this.getCart(userId);

    cart.items = cart.items.filter(
      (i) => !(i.product._id.toString() === productId && i.size === size),
    );

    return cart.save();
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    cart.items = [];
    return cart.save();
  }
}
