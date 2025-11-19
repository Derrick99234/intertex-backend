import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddToCartDto } from './dto/create-cart.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { AuthUser } from '../../common/decorators/auth-user.decorator';

@UseGuards(AuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@AuthUser() authUser) {
    const { userId } = authUser;
    return this.cartService.getCart(userId);
  }

  @Post()
  addToCart(@AuthUser() authUser, @Body() dto: AddToCartDto) {
    const { userId } = authUser;
    return this.cartService.addToCart(userId, dto);
  }

  @Put()
  updateCart(@AuthUser() authUser, @Body() dto: UpdateCartDto) {
    const { userId } = authUser;
    return this.cartService.updateItem(userId, dto);
  }

  @Delete(':productId/:size')
  removeItem(
    @AuthUser() authUser,
    @Param('productId') productId: string,
    @Param('size') size: string,
  ) {
    const { userId } = authUser;
    return this.cartService.removeItem(userId, productId, size);
  }

  @Delete()
  clearCart(@AuthUser() authUser) {
    const { userId } = authUser;
    return this.cartService.clearCart(userId);
  }
}
