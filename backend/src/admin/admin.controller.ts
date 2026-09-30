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
@Roles(Role.SUPERADMIN, Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Site Health & Real-time Vitals (Super Admin Only)
   */
  @Get('health')
  @Roles(Role.SUPERADMIN)
  async getSiteHealth() {
    return this.adminService.getSiteHealth();
  }

  /**
   * Process & System Logs (Super Admin Only)
   */
  @Get('logs')
  @Roles(Role.SUPERADMIN)
  async getProcessLogs(@Query() query: ProcessLogsQueryDto) {
    return this.adminService.getProcessLogs(query);
  }

  /**
   * Clear Process Logs (Super Admin Only)
   */
  @Post('logs/clear')
  @Roles(Role.SUPERADMIN)
  async clearProcessLogs(@Req() req: any) {
    return this.adminService.clearProcessLogs(req.user?.email);
  }

  /**
   * Logged-in Users & Active Sessions (Super Admin Only)
   */
  @Get('active-sessions')
  @Roles(Role.SUPERADMIN)
  async getActiveSessions() {
    return this.adminService.getLoggedInUsers();
  }

  /**
   * All User Activity Audit Trail (Super Admin Only)
   */
  @Get('activities')
  @Roles(Role.SUPERADMIN)
  async getActivityLogs(@Query() query: ActivityQueryDto) {
    return this.adminService.getActivityLogs(query);
  }

  /**
   * User Directory (Super Admin and Admin)
   */
  @Get('users')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async findAllUsers() {
    return this.adminService.findAllUsers();
  }

  /**
   * Reset Password for Any User (Super Admin Only)
   */
  @Post('users/:id/reset-password')
  @Roles(Role.SUPERADMIN)
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @Req() req: any,
  ) {
    return this.adminService.resetPassword(id, dto, req.user?.email);
  }

  /**
   * Update User Account Status (Enable/Disable - Super Admin and Admin)
   * Note: Security rule prevents anyone from deactivating Super Admin accounts.
   */
  @Patch('users/:id/status')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: any,
  ) {
    return this.adminService.updateUserStatus(
      id,
      dto,
      req.user?.email,
      req.user?.role,
    );
  }

  /**
   * Update User Role (Super Admin Only)
   */
  @Patch('users/:id/role')
  @Roles(Role.SUPERADMIN)
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: any,
  ) {
    return this.adminService.updateUserRole(id, dto, req.user?.email);
  }
}
