import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    authorId?: string;
    categoryId?: string;
    status?: string;
    search?: string;
    year?: string;
    month?: string;
    page?: string;
    limit?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { content: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.year) {
      const yearStr = `${query.year}-`;
      if (query.month) {
        const monthStr = `${query.year}-${String(query.month).padStart(2, '0')}`;
        where.datetime = { startsWith: monthStr };
      } else {
        where.datetime = { startsWith: yearStr };
      }
    }

    const [nodes, totalCount] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          category: true,
          author: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      nodes,
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        author: true,
      },
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async create(data: {
    title: string;
    content: string;
    description: string;
    imageUrl?: string;
    status?: string;
    categoryId: string;
    authorId: string;
  }) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
    const now = new Date();
    const dateStr = this.formatDate(now);
    const datetimeStr = this.formatDatetime(now);

    try {
      return await this.prisma.post.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          content: data.content,
          imageUrl: data.imageUrl || null,
          status: data.status || 'DRAFT',
          date: dateStr,
          datetime: datetimeStr,
          categoryId: data.categoryId,
          authorId: data.authorId,
        },
        include: {
          category: true,
          author: true,
        },
      });
    } catch (e: any) {
      throw new ConflictException(`Failed to create post: ${e.message}`);
    }
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      description?: string;
      imageUrl?: string;
      status?: string;
      categoryId?: string;
    },
  ) {
    await this.findOne(id);
    const updateData: any = { ...data };

    if (data.title) {
      updateData.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
    }

    try {
      return await this.prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          author: true,
        },
      });
    } catch (e: any) {
      throw new ConflictException(`Failed to update post: ${e.message}`);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.post.delete({
      where: { id },
    });
  }

  async getArchiveMeta() {
    const posts = await this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        datetime: true,
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    const authorMap = new Map<string, { id: string; name: string; imageUrl: string | null; count: number }>();
    const dateMap = new Map<string, { year: string; month: string; monthName: string; count: number }>();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    posts.forEach((post) => {
      if (post.author) {
        const auth = post.author;
        const existing = authorMap.get(auth.id);
        if (existing) {
          existing.count += 1;
        } else {
          authorMap.set(auth.id, {
            id: auth.id,
            name: auth.name,
            imageUrl: auth.imageUrl,
            count: 1,
          });
        }
      }

      if (post.datetime && post.datetime.length >= 7) {
        const parts = post.datetime.split('-');
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const monthName = monthNames[monthNum - 1] || 'Unknown';
        const key = `${year}-${parts[1]}`;

        const existingDate = dateMap.get(key);
        if (existingDate) {
          existingDate.count += 1;
        } else {
          dateMap.set(key, {
            year,
            month: String(monthNum),
            monthName,
            count: 1,
          });
        }
      }
    });

    return {
      authors: Array.from(authorMap.values()),
      dates: Array.from(dateMap.values()).sort((a, b) => b.year.localeCompare(a.year) || parseInt(b.month) - parseInt(a.month)),
    };
  }

  private formatDate(d: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  private formatDatetime(d: Date): string {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
