import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import { BookConsultationDto } from './consultation.dto';

interface CreateConsultationResult {
  eventId: string;
  htmlLink?: string; // Calendar event link
  meetLink?: string; // Google Meet link if generated
  start: string;
  end: string;
}

@Injectable()
export class ConsultationService {
  private readonly logger = new Logger(ConsultationService.name);
  private calendar = google.calendar('v3');
  private authClient; // JWT auth client
  private transporter; // nodemailer transporter

  constructor() {
    // Initialize Google auth (service account)
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (privateKey) {
      // Handle escaped newlines in env var
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    if (!clientEmail || !privateKey) {
      this.logger.warn('Google service account credentials missing; calendar creation will fail.');
    }
    this.authClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    // Initialize nodemailer
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      this.logger.warn('SMTP configuration incomplete; email sending will fail.');
    }
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false otherwise
      auth: { user, pass },
    });
  }

  async book(dto: BookConsultationDto): Promise<CreateConsultationResult> {
    const calendarId = process.env.CALENDAR_ID || 'primary';

    const startIso = dto.start;
    const endIso = dto.end || new Date(new Date(startIso).getTime() + 30 * 60000).toISOString();

    const summary = `Consultation with ${dto.applicantName || dto.applicantEmail}`;
    const description = `Automated booking for ${dto.applicantEmail}${dto.applicantName ? ` (Name: ${dto.applicantName})` : ''}`;

    let eventId: string = uuid();
    let htmlLink: string | undefined;
    let meetLink: string | undefined;

    try {
      const insertRes = await this.calendar.events.insert({
        auth: this.authClient,
        calendarId,
        requestBody: {
          id: eventId.replace(/-/g, ''), // Calendar event IDs must be 5-1024 chars; UUID w/o dashes fine
          summary,
          description,
          start: { dateTime: startIso },
          end: { dateTime: endIso },
          attendees: [
            { email: dto.applicantEmail },
          ],
          conferenceData: {
            createRequest: {
              requestId: uuid(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
        conferenceDataVersion: 1,
      });
      const event = insertRes.data;
      eventId = event.id || eventId;
      htmlLink = event.htmlLink;
      meetLink = event.conferenceData?.entryPoints?.find(p => p.entryPointType === 'video')?.uri;
    } catch (err) {
      this.logger.error('Failed to create calendar event', err as any);
      throw new InternalServerErrorException('Failed to create calendar event');
    }

    // Send email notification
    try {
      const from = process.env.FROM_EMAIL || `no-reply@${new URL(process.env.APP_BASE_URL || 'http://localhost').hostname}`;
      const mailText = `Your consultation has been booked.\n\nStart: ${startIso}\nEnd: ${endIso}\n${meetLink ? `Google Meet: ${meetLink}\n` : ''}If you need to reschedule reply to this email.`;
      const mailHtml = `<p>Your consultation has been booked.</p><p><strong>Start:</strong> ${startIso}<br/><strong>End:</strong> ${endIso}</p>${meetLink ? `<p><strong>Google Meet:</strong> <a href="${meetLink}">${meetLink}</a></p>` : ''}<p>If you need to reschedule reply to this email.</p>`;
      await this.transporter.sendMail({
        to: dto.applicantEmail,
        from,
        subject: summary,
        text: mailText,
        html: mailHtml,
      });
    } catch (err) {
      this.logger.error('Failed to send email', err as any);
      // Do not fail entire booking if email fails; return event info
    }

    return { eventId, htmlLink, meetLink, start: startIso, end: endIso };
  }
}
