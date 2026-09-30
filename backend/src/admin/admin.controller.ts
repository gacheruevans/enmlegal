import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import {
  ActivityQueryDto,
  ProcessLogsQueryDto,
  ResetPasswordDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './admin.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Site Health & Real-time Vitals
   */
  @Get('health')
  async getSiteHealth() {
    return this.adminService.getSiteHealth();
  }

  /**
   * Process & System Logs
   */
  @Get('logs')
  async getProcessLogs(@Query() query: ProcessLogsQueryDto) {
    return this.adminService.getProcessLogs(query);
  }

  /**
   * Clear Process Logs
   */
  @Post('logs/clear')
  async clearProcessLogs(@Req() req: any) {
    return this.adminService.clearProcessLogs(req.user?.email);
  }

  /**
   * Logged-in Users & Active Sessions
   */
  @Get('active-sessions')
  async getActiveSessions() {
    return this.adminService.getLoggedInUsers();
  }

  /**
   * All User Activity Audit Trail
   */
  @Get('activities')
  async getActivityLogs(@Query() query: ActivityQueryDto) {
    return this.adminService.getActivityLogs(query);
  }

  /**
   * User Directory
   */
  @Get('users')
  async findAllUsers() {
    return this.adminService.findAllUsers();
  }

  /**
   * Reset Password for Any User
   */
  @Post('users/:id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @Req() req: any,
  ) {
    return this.adminService.resetPassword(id, dto, req.user?.email);
  }

  /**
   * Update User Account Status (Enable/Disable)
   */
  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: any,
  ) {
    return this.adminService.updateUserStatus(id, dto, req.user?.email);
  }

  /**
   * Update User Role
   */
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: any,
  ) {
    return this.adminService.updateUserRole(id, dto, req.user?.email);
  }
}
