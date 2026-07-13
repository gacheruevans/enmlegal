import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(
    @Query('authorId') authorId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findAll({
      authorId,
      categoryId,
      status: status === 'ALL' ? undefined : (status || 'PUBLISHED'),
      search,
      year,
      month,
      page,
      limit,
    });
  }

  @Get('archive-meta')
  async getArchiveMeta() {
    return this.postsService.getArchiveMeta();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: any,
    @Body()
    body: {
      title: string;
      content: string;
      description: string;
      imageUrl?: string;
      status?: string;
      categoryId: string;
    },
  ) {
    return this.postsService.create({
      ...body,
      authorId: req.user.sub,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      content?: string;
      description?: string;
      imageUrl?: string;
      status?: string;
      categoryId?: string;
    },
  ) {
    return this.postsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const appUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    return {
      url: `${appUrl}/uploads/${file.filename}`,
    };
  }
}
