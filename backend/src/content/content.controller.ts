import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Role } from '@prisma/client';
import { ContentService } from './content.service';
import { UpdateContentDto } from './content.dto';

@ApiTags('content')
@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /**
   * Public: Retrieve published content for all website sections
   */
  @Public()
  @Get('content')
  async getPublicContent() {
    return this.contentService.getPublicContent();
  }

  /**
   * Public: Retrieve published content for a specific section
   */
  @Public()
  @Get('content/:section')
  async getSectionPublicContent(@Param('section') section: string) {
    return this.contentService.getSectionPublicContent(section);
  }

  /**
   * Super Admin Only: Retrieve all sections including drafts & publication statuses
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Get('admin/content')
  async getAdminContent() {
    return this.contentService.getAdminContent();
  }

  /**
   * Super Admin Only: Update section content (Save Draft or Publish)
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Put('admin/content/:section')
  async updateSectionContent(
    @Param('section') section: string,
    @Body() dto: UpdateContentDto,
    @Req() req: any,
  ) {
    return this.contentService.updateSectionContent(
      section,
      dto,
      req.user?.email,
    );
  }

  /**
   * Super Admin Only: Discard working draft and revert to published version
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @Post('admin/content/:section/revert')
  async revertDraft(@Param('section') section: string, @Req() req: any) {
    return this.contentService.revertDraft(section, req.user?.email);
  }
}
