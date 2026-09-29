/* eslint-disable prettier/prettier */
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import { BookConsultationDto, UpdateConsultationStatusDto } from './consultation.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateConsultationResult {
  id: string;
  eventId?: string;
  htmlLink?: string; // Calendar event link
  meetLink?: string; // Google Meet link if generated
  start: string;
  end: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  whatsAppLink?: string;
  whatsAppStatus?: 'SENT' | 'PENDING' | 'CONFIG_REQUIRED';
  whatsAppMessage?: string;
}

@Injectable()
export class ConsultationService {
  private readonly logger = new Logger(ConsultationService.name);
  private calendar = google.calendar('v3');
  private authClient: any = null;
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly prisma: PrismaService) {
    // Initialize Google auth (service account)
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    if (!clientEmail || !privateKey) {
      this.logger.warn(
        'Google service account credentials missing; calendar creation will be skipped/fallback.',
      );
    } else {
      this.authClient = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
    }

    // Initialize nodemailer
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT, 10)
      : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP configuration incomplete; email sending will be skipped.',
      );
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async book(dto: BookConsultationDto): Promise<CreateConsultationResult> {
    const calendarId = process.env.CALENDAR_ID || 'primary';

    const startDate = new Date(dto.start);
    const durationMinutes = dto.durationMinutes || 30;
    const endDate = dto.end
      ? new Date(dto.end)
      : new Date(startDate.getTime() + durationMinutes * 60000);

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const summary = `Legal Consultation: ${dto.applicantName || dto.applicantEmail}`;
    const description = `Consultation request for ${dto.applicantEmail}${dto.applicantName ? ` (Name: ${dto.applicantName})` : ''}${dto.applicantPhone ? `\nPhone: ${dto.applicantPhone}` : ''}${dto.notes ? `\nClient Notes: ${dto.notes}` : ''}`;

    // 1. Create database record first (ensures booking is never lost)
    const record = await this.prisma.consultation.create({
      data: {
        applicantName: dto.applicantName || 'Prospective Client',
        applicantEmail: dto.applicantEmail.toLowerCase().trim(),
        applicantPhone: dto.applicantPhone || null,
        start: startDate,
        end: endDate,
        durationMinutes,
        status: 'CONFIRMED',
        notes: dto.notes || null,
      },
    });

    let eventId: string | undefined;
    let htmlLink: string | undefined;
    let meetLink: string | undefined;

    // 2. Schedule with Google Calendar if credentials exist
    if (this.authClient) {
      try {
        const generatedEventId = uuid().replace(/-/g, '');
        const insertRes: any = await this.calendar.events.insert({
          calendarId,
          auth: this.authClient,
          requestBody: {
            id: generatedEventId,
            summary,
            description,
            start: { dateTime: startIso },
            end: { dateTime: endIso },
            attendees: [{ email: dto.applicantEmail }],
            conferenceData: {
              createRequest: {
                requestId: uuid(),
                conferenceSolutionKey: {
                  type: 'hangoutsMeet',
                },
              },
            },
          },
          conferenceDataVersion: 1,
        });

        const event = insertRes.data;
        eventId = event.id ?? generatedEventId;
        htmlLink = event.htmlLink ?? undefined;
        meetLink =
          event.conferenceData?.entryPoints?.find(
            (entry: any) => entry.entryPointType === 'video',
          )?.uri ?? undefined;

        // Update database record with calendar details
        await this.prisma.consultation.update({
          where: { id: record.id },
          data: {
            calendarEventId: eventId,
            calendarLink: htmlLink,
            meetLink,
          },
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to create Google Calendar event: ${message}`);
      }
    }

    // 3. Send email confirmation if SMTP transporter is configured
    try {
      if (this.transporter) {
        const from =
          process.env.FROM_EMAIL ||
          `no-reply@${new URL(process.env.APP_BASE_URL || 'http://localhost').hostname}`;
        const mailText = `Dear ${dto.applicantName || 'Client'},\n\nYour consultation with ENM Legal has been booked successfully.\n\nDate & Time: ${startDate.toLocaleString()} - ${endDate.toLocaleString()}\n${meetLink ? `Google Meet Link: ${meetLink}\n` : ''}\nIf you have any questions or need to reschedule, please reply directly to this email.\n\nBest regards,\nENM Legal Advocates`;
        const mailHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #1e3a8a;">Consultation Confirmation — ENM Legal</h2>
          <p>Dear <strong>${dto.applicantName || 'Client'}</strong>,</p>
          <p>Your legal consultation has been received and confirmed.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Start Time:</strong> ${startDate.toLocaleString()}</p>
            <p style="margin: 4px 0;"><strong>End Time:</strong> ${endDate.toLocaleString()}</p>
            <p style="margin: 4px 0;"><strong>Duration:</strong> ${durationMinutes} minutes</p>
            ${meetLink ? `<p style="margin: 8px 0;"><strong>Google Meet:</strong> <a href="${meetLink}" style="color: #2563eb; font-weight: bold;">Join Video Consultation</a></p>` : ''}
          </div>
          <p>If you need to reschedule, please contact us by replying to this email.</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">ENM Legal Advocates • Nairobi, Kenya</p>
        </div>`;

        await this.transporter.sendMail({
          to: dto.applicantEmail,
          from,
          subject: `Consultation Confirmed: ENM Legal`,
          text: mailText,
          html: mailHtml,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to send consultation confirmation email: ${message}`);
    }

    // 4. Send WhatsApp notification to advocate (+254 701-857-030)
    let whatsAppLink: string | undefined;
    let whatsAppStatus: 'SENT' | 'PENDING' | 'CONFIG_REQUIRED' | undefined;
    let whatsAppMessage: string | undefined;

    try {
      const waResult = await this.notifyAdvocateViaWhatsApp({
        applicantName: dto.applicantName || 'Prospective Client',
        applicantEmail: dto.applicantEmail,
        applicantPhone: dto.applicantPhone,
        start: startDate,
        durationMinutes,
        notes: dto.notes,
        meetLink,
      });
      whatsAppLink = waResult.whatsAppLink;
      whatsAppStatus = waResult.whatsAppStatus;
      whatsAppMessage = waResult.message;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to process WhatsApp notification for advocate: ${message}`);
    }

    return {
      id: record.id,
      eventId,
      htmlLink,
      meetLink,
      start: startIso,
      end: endIso,
      applicantName: record.applicantName,
      applicantEmail: record.applicantEmail,
      status: record.status,
      whatsAppLink,
      whatsAppStatus,
      whatsAppMessage,
    };
  }

  /**
   * Dispatches a structured WhatsApp consultation notification to the advocate (+254 701-857-030).
   * Supports:
   * 1. Twilio WhatsApp API (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)
   * 2. Meta WhatsApp Cloud API (WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID)
   * 3. CallMeBot WhatsApp API (CALLMEBOT_API_KEY)
   * 4. Custom WhatsApp Webhook (WHATSAPP_WEBHOOK_URL)
   * Always constructs an official WhatsApp deep link (https://wa.me/254701857030) for instant client/advocate sync.
   */
  private async notifyAdvocateViaWhatsApp(params: {
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    start: Date;
    durationMinutes: number;
    notes?: string;
    meetLink?: string;
  }): Promise<{ whatsAppLink: string; whatsAppStatus: 'SENT' | 'PENDING' | 'CONFIG_REQUIRED'; message: string }> {
    const rawPhone = process.env.ADVOCATE_WHATSAPP_PHONE || '+254 701-857-030';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, ''); // 254701857030

    const formattedStart = params.start.toLocaleString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const message = [
      `⚖️ *NEW LEGAL CONSULTATION BOOKING*`,
      `*ENM Legal Advocates*`,
      ``,
      `👤 *Client Name:* ${params.applicantName}`,
      `📧 *Client Email:* ${params.applicantEmail}`,
      `📞 *Client Phone:* ${params.applicantPhone || 'Not provided'}`,
      `📅 *Date & Time:* ${formattedStart}`,
      `⏱️ *Duration:* ${params.durationMinutes} Minutes`,
      params.meetLink ? `🎥 *Google Meet:* ${params.meetLink}` : null,
      params.notes ? `\n📝 *Inquiry / Notes:*\n${params.notes}` : null,
      ``,
      `_Automated alert from ENM Legal Consultation System_`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const whatsAppLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    let whatsAppStatus: 'SENT' | 'PENDING' | 'CONFIG_REQUIRED' = 'CONFIG_REQUIRED';

    // 1. Try Twilio WhatsApp API
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER;
    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const fromFormatted = twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`;
        const toFormatted = `whatsapp:+${cleanPhone}`;
        const bodyParams = new URLSearchParams();
        bodyParams.append('From', fromFormatted);
        bodyParams.append('To', toFormatted);
        bodyParams.append('Body', message);

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyParams.toString(),
        });

        if (res.ok) {
          this.logger.log(`WhatsApp notification dispatched to Advocate (+${cleanPhone}) via Twilio.`);
          whatsAppStatus = 'SENT';
          return { whatsAppLink, whatsAppStatus, message };
        } else {
          const errText = await res.text();
          this.logger.warn(`Twilio WhatsApp dispatch failed: ${res.status} ${errText}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Twilio WhatsApp dispatch exception: ${msg}`);
      }
    }

    // 2. Try Meta WhatsApp Cloud API
    const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
    const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (metaToken && metaPhoneId) {
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${metaToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: message },
          }),
        });

        if (res.ok) {
          this.logger.log(`WhatsApp notification dispatched to Advocate (+${cleanPhone}) via Meta Cloud API.`);
          whatsAppStatus = 'SENT';
          return { whatsAppLink, whatsAppStatus, message };
        } else {
          const errText = await res.text();
          this.logger.warn(`Meta WhatsApp Cloud API dispatch failed: ${res.status} ${errText}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Meta WhatsApp Cloud API dispatch exception: ${msg}`);
      }
    }

    // 3. Try CallMeBot WhatsApp API
    const callmebotKey = process.env.CALLMEBOT_API_KEY;
    if (callmebotKey) {
      try {
        const res = await fetch(
          `https://api.callmebot.com/whatsapp.php?phone=+${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${callmebotKey}`,
        );
        if (res.ok) {
          this.logger.log(`WhatsApp notification dispatched to Advocate (+${cleanPhone}) via CallMeBot.`);
          whatsAppStatus = 'SENT';
          return { whatsAppLink, whatsAppStatus, message };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`CallMeBot WhatsApp dispatch exception: ${msg}`);
      }
    }

    // 4. Try Generic WhatsApp Webhook
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: `+${cleanPhone}`,
            phone: cleanPhone,
            message,
            applicantName: params.applicantName,
            applicantEmail: params.applicantEmail,
            applicantPhone: params.applicantPhone,
            start: params.start.toISOString(),
            durationMinutes: params.durationMinutes,
          }),
        });
        if (res.ok) {
          this.logger.log(`WhatsApp notification dispatched to Advocate (+${cleanPhone}) via Webhook.`);
          whatsAppStatus = 'SENT';
          return { whatsAppLink, whatsAppStatus, message };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`WhatsApp Webhook dispatch exception: ${msg}`);
      }
    }

    this.logger.log(
      `WhatsApp notification link prepared for Advocate (+${cleanPhone}). Deep link: https://wa.me/${cleanPhone}`,
    );
    return { whatsAppLink, whatsAppStatus, message };
  }

  async findAll(query: { page?: string; limit?: string; status?: string }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    const [nodes, totalCount] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        orderBy: { start: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return {
      nodes,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    };
  }

  async findOne(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
    });
    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }
    return consultation;
  }

  async updateStatus(id: string, dto: UpdateConsultationStatusDto) {
    await this.findOne(id);
    return this.prisma.consultation.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.consultation.delete({
      where: { id },
    });
  }
}

