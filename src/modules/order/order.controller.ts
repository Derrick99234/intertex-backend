import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './order.service';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { AdminAuthGuard } from '../auth/guard/admin.guard';
import { AnyAuthGuard } from '../auth/guard/any-auth.guard';
import { PaginationQuery } from '../../common/utils/pagination.util';

@SkipThrottle()
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
  findAll(@Query() query: PaginationQuery) {
    return this.ordersService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async findAllByUser(@AuthUser() authUser, @Query() query: PaginationQuery) {
    const { userId } = authUser;
    return this.ordersService.findAllByUser(userId, query);
  }

  @UseGuards(AuthGuard)
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
