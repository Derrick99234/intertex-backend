import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { writeFileSync } from 'fs';
import * as path from 'path';

import { faker } from '@faker-js/faker';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { fullName, email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      email,
      fullName,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async deleteAllUsers(): Promise<void> {
    const exceptionEmail = 'pshubomi@gmail.com';

    await this.userModel.deleteMany({
      email: { $ne: exceptionEmail }, // delete where email is NOT equal to exceptionEmail
    });

    console.log(`All users deleted except ${exceptionEmail} ❌`);
  }

  async generateFakeUsers(count: number = 50): Promise<void> {
    await this.deleteAllUsers(); // First, delete old users

    const users = [];
    const exportedUsers = [];

    for (let i = 0; i < count; i++) {
      const rawPassword = faker.internet.password();
      const email = faker.internet.email();

      const fakeUser = {
        fullName: faker.person.fullName(),
        email,
        password: await bcrypt.hash(rawPassword, 10),
      };

      users.push(fakeUser);

      // Save raw password version for JSON export
      exportedUsers.push({
        fullName: fakeUser.fullName,
        email: fakeUser.email,
        password: rawPassword,
      });
    }

    await this.userModel.insertMany(users);
    console.log(`${count} fake users created 🎉`);

    const filePath = path.join(__dirname, '../../fake-users.json');
    writeFileSync(filePath, JSON.stringify(exportedUsers, null, 2));
    console.log(`Exported raw users to ${filePath} 📄`);
  }
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { message: 'User deleted successfully' };
  }
}
