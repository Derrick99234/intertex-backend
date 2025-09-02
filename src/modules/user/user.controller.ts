import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('get-user')
  getUser(@AuthUser() authUser: any) {
    const { userId } = authUser;
    return this.userService.findOne(userId);
  }

  @Get('/:id')
  getUserByID(@Param('id') userId: string) {
    return this.userService.findOne(userId);
  }

  @UseGuards(AuthGuard)
  @Patch('update')
  update(@AuthUser() authUser: any, @Body() updateUserDto: UpdateUserDto) {
    const { userId } = authUser;
    return this.userService.update(userId, updateUserDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
