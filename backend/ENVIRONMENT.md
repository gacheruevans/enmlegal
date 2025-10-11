# Backend Environment Variables

Set these in a `.env` file at `backend/.env` (ensure not committed if containing secrets).

## Google Calendar (Service Account)
- GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
- GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"  (Ensure newlines are literal or escape as `\n` and code replaces them.)
- CALENDAR_ID=primary  (or the specific calendar ID / email)

To create a Meet link the service account must have permission to create events and conference data on the calendar. Share the target calendar with the service account email with "Make changes" permission.

## SMTP Email
- SMTP_HOST=smtp.yourprovider.com
- SMTP_PORT=587
- SMTP_USER=your_smtp_username
- SMTP_PASS=your_smtp_password
- FROM_EMAIL=Bookings <no-reply@yourdomain.com>

## App Base URL (optional for dynamic FROM domain fallback)
- APP_BASE_URL=https://your-frontend-domain.com

## Optional
- TZ=UTC (You can standardize runtime timezone if needed.)

## Notes
1. Private key formatting: In many deployment platforms you must escape newlines as `\n`. The code already unescapes them.
2. Duration: If client does not send `end`, backend will set end = start + 30 minutes.
3. Validation: Using class-validator manually in controller; consider enabling global ValidationPipe in `main.ts`.
4. Failure modes: If email fails you still get calendar event info; handle that in frontend.
5. Credential strategy: You can instead use OAuth2 flow if you need user-specific calendars; service account is simplest for a single team calendar.
