// post.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogPostDocument } from '../../schemas/blog.schema';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import { UpdateBlogPostDto } from './dto/update-blog.dto';
@Injectable()
export class BlogPostService {
  constructor(
    @InjectModel(BlogPost.name) private postModel: Model<BlogPostDocument>,
  ) {}

  async create(
    createPostDto: CreateBlogPostDto,
    imageCover: string,
  ): Promise<BlogPost> {
    const newPost = new this.postModel({ ...createPostDto, imageCover });
    return newPost.save();
  }

  async findAll(): Promise<BlogPost[]> {
    return this.postModel.find().exec();
  }

  async findOne(id: string): Promise<BlogPost> {
    const post = await this.postModel.findById(id).exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdateBlogPostDto,
    imageCover?: string,
  ): Promise<BlogPost> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, { ...updatePostDto, imageCover }, { new: true })
      .exec();
    if (!updatedPost) throw new NotFoundException('Post not found');
    return updatedPost;
  }

  async remove(id: string): Promise<string> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Post not found');
    return 'Post deleted successfully';
  }
}
