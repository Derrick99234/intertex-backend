// src/modules/subcategory/subcategory.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Controller('subcategories')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  create(@Body() createDto: CreateSubcategoryDto) {
    return this.subcategoryService.create(createDto);
  }

  @Get()
  findAll() {
    return this.subcategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSubcategoryDto) {
    return this.subcategoryService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoryService.remove(id);
  }

  @Get('/category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.subcategoryService.findByCategory(categoryId);
  }
}
