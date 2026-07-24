import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(data: { title: string }) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    try {
      return await this.prisma.category.create({
        data: {
          title: data.title,
          slug,
        },
      });
    } catch {
      throw new ConflictException(
        `Category with title "${data.title}" already exists`,
      );
    }
  }

  async update(id: string, data: { title?: string }) {
    await this.findOne(id);
    const updateData: any = {};
    if (data.title) {
      updateData.title = data.title;
      updateData.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateData,
      });
    } catch {
      throw new ConflictException(`Category title conflict`);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
