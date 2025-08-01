import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';

@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Post()
  async create(@Body() createDto: CreateTypeDto) {
    const type = await this.typeService.create(createDto);
    return {
      message: 'Type created successfully',
      data: type,
    };
  }

  @Get()
  async findAll() {
    const types = await this.typeService.findAll();
    return {
      message: 'All types fetched successfully',
      data: types,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const type = await this.typeService.findOne(id);
    return {
      message: 'Type fetched successfully',
      data: type,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateTypeDto) {
    const updated = await this.typeService.update(id, updateDto);
    return {
      message: 'Type updated successfully',
      data: updated,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.typeService.remove(id);
  }

  @Get('/by-subcategory/:subcategoryId')
  async findBySubcategory(@Param('subcategoryId') subcategoryId: string) {
    const types = await this.typeService.findBySubcategory(subcategoryId);
    return {
      message: 'Types under this subcategory fetched successfully',
      data: types,
    };
  }
}
