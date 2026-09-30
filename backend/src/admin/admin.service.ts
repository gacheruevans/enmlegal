import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogBufferService } from './log-buffer.service';
import {
  ActivityQueryDto,
  ProcessLogsQueryDto,
  ResetPasswordDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  CreateUserDto,
} from './admin.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Role } from '@prisma/client';

export interface ActiveSessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  imageUrl?: string | null;
  lastLoginAt: Date | null;
  lastActiveAt: Date | null;
  isOnline: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  // In-memory active session map: userId -> session details
  private readonly activeSessions = new Map<
    string,
    {
      userId: string;
      email: string;
      role: Role;
      name: string;
      lastActive: Date;
      ipAddress?: string;
      userAgent?: string;
    }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly logBuffer: LogBufferService,
  ) {}

  /**
   * Tracks an active user session in memory and throttles DB lastActiveAt updates
   */
  touchSession(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const now = new Date();
    this.activeSessions.set(user.id, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      lastActive: now,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
    });

    // Clean up stale in-memory sessions older than 30 minutes
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    for (const [key, session] of this.activeSessions.entries()) {
      if (session.lastActive.getTime() < thirtyMinAgo) {
        this.activeSessions.delete(key);
      }
    }
  }

  removeSession(userId: string) {
    this.activeSessions.delete(userId);
  }

  /**
   * Comprehensive site health check: Database connection latency, metrics, and memory
   */
  async getSiteHealth() {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    let dbLatencyMs = -1;
    let tableCounts = {
      users: 0,
      posts: 0,
      categories: 0,
      consultations: 0,
      activityLogs: 0,
    };

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
      dbStatus = 'connected';

      const [users, posts, categories, consultations, activityLogs] =
        await Promise.all([
          this.prisma.user.count(),
          this.prisma.post.count(),
          this.prisma.category.count(),
          this.prisma.consultation.count(),
          this.prisma.activityLog.count(),
        ]);

      tableCounts = {
        users,
        posts,
        categories,
        consultations,
        activityLogs,
      };
    } catch (err: any) {
      this.logger.error(`Database health check failed: ${err.message}`);
      this.logBuffer.addLog('error', 'Database', `DB Ping failed: ${err.message}`);
    }

    const memoryUsage = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    let dbInfo = 'PostgreSQL (Neon)';
    if (process.env.DATABASE_URL) {
      try {
        const parsed = new URL(process.env.DATABASE_URL);
        dbInfo = `Neon PostgreSQL (${parsed.hostname})`;
      } catch {
        // Fallback
      }
    }

    return {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        provider: dbInfo,
        latencyMs: dbLatencyMs,
        tables: tableCounts,
      },
      system: {
        uptimeSeconds: uptimeSec,
        uptimeFormatted: this.formatUptime(uptimeSec),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'production',
        pid: process.pid,
        activeSessionsCount: this.activeSessions.size,
        memory: {
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          externalMb: Math.round(memoryUsage.external / 1024 / 1024),
        },
      },
    };
  }

  /**
   * Retrieves process logs from in-memory ring buffer
   */
  getProcessLogs(query: ProcessLogsQueryDto) {
    const limit = query.limit ? parseInt(query.limit, 10) : 100;
    return this.logBuffer.getLogs({
      level: query.level,
      search: query.search,
      limit,
    });
  }

  /**
   * Clears the in-memory process logs
   */
  clearProcessLogs(actorEmail?: string) {
    this.logBuffer.clearLogs();
    this.recordActivity({
      userEmail: actorEmail,
      action: 'CLEAR_PROCESS_LOGS',
      details: 'Super Admin cleared process logs buffer',
    });
    return { success: true, message: 'Process log buffer cleared successfully' };
  }

  /**
   * Retrieves logged-in users / active sessions
   */
  async getLoggedInUsers(): Promise<ActiveSessionUser[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        isActive: true,
        lastLoginAt: true,
        lastActiveAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const sessionUsers = users.map((u) => {
      const memSession = this.activeSessions.get(u.id);
      const isOnline =
        (memSession && memSession.lastActive.getTime() > fiveMinutesAgo) ||
        (u.lastActiveAt && u.lastActiveAt.getTime() > fiveMinutesAgo) ||
        false;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        imageUrl: u.imageUrl,
        lastLoginAt: u.lastLoginAt,
        lastActiveAt: memSession?.lastActive || u.lastActiveAt,
        isOnline,
        ipAddress: memSession?.ipAddress || null,
        userAgent: memSession?.userAgent || null,
      };
    });

    // Sort online users first, then by last active timestamp descending
    return sessionUsers.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  /**
   * Retrieves audit / user activity trail
   */
  async getActivityLogs(query: ActivityQueryDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.action && query.action !== 'ALL') {
      where.action = query.action;
    }

    if (query.search) {
      where.OR = [
        { userEmail: { contains: query.search, mode: 'insensitive' } },
        { details: { contains: query.search, mode: 'insensitive' } },
        { action: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Records a user activity into database and process logs
   */
  async recordActivity(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const record = await this.prisma.activityLog.create({
        data: {
          userId: data.userId || null,
          userEmail: data.userEmail || null,
          action: data.action,
          details: data.details || null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });

      this.logBuffer.addLog(
        'info',
        'Activity',
        `[${data.action}] ${data.userEmail || 'Anonymous'}: ${data.details || 'No details'}`,
      );

      return record;
    } catch (err: any) {
      this.logger.error(`Failed to record activity log: ${err.message}`);
      return null;
    }
  }

  /**
   * Retrieves all users for administration
   */
  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        imageUrl: true,
        isActive: true,
        lastLoginAt: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            activityLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Creates a new user account.
   * Accessible by both Super Admin and Admin.
   * STRICT SECURITY RULE: Non-SuperAdmins cannot create SuperAdmin accounts.
   */
  async createUser(
    dto: CreateUserDto,
    actorEmail?: string,
    actorRole?: Role,
  ) {
    const cleanEmail = dto.email.toLowerCase().trim();

    // Check if email is already taken
    const existing = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new BadRequestException(`A user with email ${cleanEmail} already exists.`);
    }

    const assignedRole = dto.role || Role.ADMIN;

    // Strict Rule: Non-SuperAdmins cannot create SuperAdmin accounts
    if (assignedRole === Role.SUPERADMIN && actorRole !== Role.SUPERADMIN) {
      throw new ForbiddenException(
        'Security Violation: Administrators do not have authorization to create Super Administrator accounts.',
      );
    }

    // Hash password with bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        phone: dto.phone?.trim() || null,
        imageUrl: dto.imageUrl?.trim() || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        imageUrl: true,
        isActive: true,
        lastLoginAt: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.recordActivity({
      userId: newUser.id,
      userEmail: actorEmail,
      action: 'USER_CREATED',
      details: `New ${newUser.role} user created: ${newUser.email} (${newUser.name}) by ${actorRole || 'ADMIN'} ${actorEmail || ''}`,
    });

    this.logBuffer.addLog(
      'info',
      'Security',
      `New user account ${newUser.email} (${newUser.role}) created by ${actorRole || 'ADMIN'} (${actorEmail || 'System'})`,
    );

    return {
      success: true,
      message: `User account for ${newUser.name} (${newUser.email}) has been created successfully.`,
      user: newUser,
    };
  }

  /**
   * Resets password for any user (Super Admin privilege)
   */
  async resetPassword(
    userId: string,
    dto: ResetPasswordDto,
    actorEmail?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Generate secure temporary password if not explicitly supplied
    const tempPassword =
      dto.newPassword ||
      `ENM#${crypto.randomBytes(4).toString('hex').toUpperCase()}!${Math.floor(100 + Math.random() * 900)}`;

    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Record audit event
    await this.recordActivity({
      userId,
      userEmail: actorEmail,
      action: 'PASSWORD_RESET',
      details: `Super Admin reset password for ${user.email} (${user.name})`,
    });

    this.logBuffer.addLog(
      'warn',
      'Security',
      `Super Admin (${actorEmail || 'System'}) reset password for user ${user.email}`,
    );

    return {
      success: true,
      message: `Password for ${user.name} (${user.email}) has been reset successfully.`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      temporaryPassword: tempPassword,
    };
  }

  /**
   * Updates user active status (activation / deactivation).
   * Allowed for both Super Admin and Admin.
   * STRICT SECURITY RULE: No admin can deactivate a Super Admin user account.
   */
  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    actorEmail?: string,
    actorRole?: Role,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // STRICT RULE: No admin can deactivate a Super Admin user account
    if (user.role === Role.SUPERADMIN && !dto.isActive) {
      this.logger.warn(
        `Blocked attempt by ${actorRole || 'ADMIN'} (${actorEmail || 'unknown'}) to deactivate Super Admin: ${user.email}`,
      );
      throw new ForbiddenException(
        'Security Violation: No administrator is permitted to deactivate a Super Administrator account.',
      );
    }

    // Strict Rule: Non-SuperAdmins cannot modify any attribute of a SuperAdmin account
    if (user.role === Role.SUPERADMIN && actorRole !== Role.SUPERADMIN) {
      throw new ForbiddenException(
        'Security Violation: Administrators do not have authorization to modify Super Administrator accounts.',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: dto.isActive },
    });

    const actionTag = dto.isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED';
    await this.recordActivity({
      userId,
      userEmail: actorEmail,
      action: actionTag,
      details: `User account ${dto.isActive ? 'ACTIVATED' : 'DEACTIVATED'} for ${user.email} (${user.name}) by ${actorRole || 'ADMIN'} ${actorEmail || ''}`,
    });

    this.logBuffer.addLog(
      'warn',
      'Security',
      `User ${user.email} account ${dto.isActive ? 'ACTIVATED' : 'DEACTIVATED'} by ${actorRole || 'ADMIN'} (${actorEmail || 'System'})`,
    );

    return updated;
  }

  /**
   * Updates user role
   */
  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
    actorEmail?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
    });

    await this.recordActivity({
      userId,
      userEmail: actorEmail,
      action: 'USER_ROLE_CHANGE',
      details: `Role changed from ${user.role} to ${dto.role} for ${user.email}`,
    });

    return updated;
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
