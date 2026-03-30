import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './order.service';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { AdminAuthGuard } from '../auth/guard/admin.guard';
import { AnyAuthGuard } from '../auth/guard/any-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@AuthUser() authUser: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(authUser.userId, createOrderDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async findAllByUser(@AuthUser() authUser) {
    const { userId } = authUser;
    return this.ordersService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(AnyAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
