import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  ScaleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import api from "../../lib/api";

interface ConsultationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const PRACTICE_AREAS = [
  "Corporate & Commercial Law",
  "Conveyancing & Real Estate",
  "Banking & Financial Securities",
  "Probate & Estate Administration",
  "Civil Litigation & Dispute Resolution",
  "General Legal Advisory",
];

const DURATION_OPTIONS = [
  { value: 15, label: "15 min", description: "Brief Intake" },
  { value: 30, label: "30 min", description: "Standard Session", isDefault: true },
  { value: 45, label: "45 min", description: "Detailed Review" },
  { value: 60, label: "60 min", description: "Comprehensive" },
];

const ADVOCATE_PHONE_DISPLAY = "+254 701-857-030";
const ADVOCATE_PHONE_RAW = "254701857030";

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [practiceArea, setPracticeArea] = useState(PRACTICE_AREAS[0]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [result, setResult] = useState<{
    meetLink?: string;
    start?: string;
    end?: string;
    applicantName?: string;
    applicantEmail?: string;
  } | null>(null);
  const [icsData, setIcsData] = useState<string | null>(null);
  const [whatsAppLink, setWhatsAppLink] = useState<string>("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPracticeArea(PRACTICE_AREAS[0]);
    setSelectedDate(null);
    setDurationMinutes(30);
    setNotes("");
    setError(null);
    setIsSuccess(false);
    setResult(null);
    setIcsData(null);
    setWhatsAppLink("");
  };

  const handleClose = () => {
    resetForm();
    onRequestClose();
  };

  const generateIcs = (
    start: Date,
    duration: number,
    applicantName: string,
    applicantEmail: string,
    area: string,
  ) => {
    const end = new Date(start.getTime() + duration * 60000);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmtLocal = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const dtStartLocal = fmtLocal(start);
    const dtEndLocal = fmtLocal(end);
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@enmlegal.com`;
    const summary = `Legal Consultation: ENM Legal Advocates (${area})`;
    const description = `Consultation with Advocate Eva Nduta Munene / ENM Legal Advocates for ${applicantName || applicantEmail}.\nPractice Area: ${area}\nClient Phone: ${phone || "N/A"}`;
    const vtimezone = `BEGIN:VTIMEZONE\nTZID:${tz}\nEND:VTIMEZONE`;

    return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ENMLegal//Consultation//EN\n${vtimezone}\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dtStartLocal}Z\nDTSTART;TZID=${tz}:${dtStartLocal}\nDTEND;TZID=${tz}:${dtEndLocal}\nSUMMARY:${summary}\nDESCRIPTION:${description}\nORGANIZER;CN="ENM Legal Advocates":mailto:info@enmlegal.com\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !email) {
      setError("Please select a date, time, and provide your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const clientNotes = `[Practice Area: ${practiceArea}]${notes ? `\nDetails: ${notes}` : ""}`;

    try {
      const payload = {
        applicantName: name.trim() || undefined,
        applicantEmail: email.trim().toLowerCase(),
        applicantPhone: phone.trim() || undefined,
        start: selectedDate.toISOString(),
        durationMinutes,
        notes: clientNotes,
      };

      const { data } = await api.post("/consultations/book", payload);
      const ics = generateIcs(
        selectedDate,
        durationMinutes,
        name || "Prospective Client",
        email,
        practiceArea,
      );

      const formattedStartDate = selectedDate.toLocaleString("en-KE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const fallbackWaMessage = [
        `⚖️ *NEW LEGAL CONSULTATION BOOKING*`,
        `*ENM Legal Advocates*`,
        ``,
        `👤 *Client Name:* ${name.trim() || "Prospective Client"}`,
        `📧 *Client Email:* ${email.trim()}`,
        `📞 *Client Phone:* ${phone.trim() || "Not provided"}`,
        `🏛️ *Practice Area:* ${practiceArea}`,
        `📅 *Date & Time:* ${formattedStartDate}`,
        `⏱️ *Duration:* ${durationMinutes} Minutes`,
        notes.trim() ? `\n📝 *Inquiry Details:*\n${notes.trim()}` : null,
        ``,
        `_Sent via ENM Legal Booking System_`,
      ]
        .filter(Boolean)
        .join("\n");

      const directWaLink =
        data?.whatsAppLink ||
        `https://wa.me/${ADVOCATE_PHONE_RAW}?text=${encodeURIComponent(fallbackWaMessage)}`;

      setWhatsAppLink(directWaLink);

      // Attempt immediate dispatch to WhatsApp so advocate gets the consultation alert
      try {
        window.open(directWaLink, "_blank", "noopener,noreferrer");
      } catch {
        // Fallback gracefully to the on-screen WhatsApp action card
      }

      setIcsData(ics);
      setResult({
        start: data.start || selectedDate.toISOString(),
        end:
          data.end ||
          new Date(selectedDate.getTime() + durationMinutes * 60000).toISOString(),
        meetLink: data.meetLink || undefined,
        applicantName: name || "Client",
        applicantEmail: email,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to schedule consultation at this time. Please contact us directly at info@enmlegal.com or +254 701-857-030.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!icsData) return;
    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ENM-Legal-Consultation-${Date.now()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Schedule a Legal Consultation"
      ariaHideApp={false}
      className="relative w-full max-w-xl mx-auto my-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
      overlayClassName="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Modal Top Decorative Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-royal to-amber-500" />

      {/* Close Button */}
      <button
        type="button"
        onClick={handleClose}
        title="Close dialog"
        aria-label="Close consultation dialog"
        className="absolute top-5 right-5 z-20 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      {/* SUCCESS CONFIRMATION VIEW */}
      {isSuccess && result ? (
        <div className="p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-sm animate-bounce">
            <CheckCircleIcon className="w-9 h-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            Booking Confirmed
          </span>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Consultation Request Received
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Thank you for reaching out to ENM Legal Advocates. We have reserved your appointment slot.
          </p>

          {/* Appointment Summary Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left mb-6 text-sm text-slate-700 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Practice Area
              </span>
              <span className="font-semibold text-slate-900">{practiceArea}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Scheduled Time
              </span>
              <span className="font-semibold text-slate-900">
                {result.start ? new Date(result.start).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                }) : "To be confirmed"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Duration
              </span>
              <span className="font-semibold text-slate-900">{durationMinutes} Minutes</span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Confirmation Sent To
              </span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {result.applicantEmail}
              </span>
            </div>
          </div>

          {/* Advocate WhatsApp Alert Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-white border border-emerald-200/90 rounded-2xl p-4 sm:p-5 text-left mb-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Advocate WhatsApp Alert
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {ADVOCATE_PHONE_DISPLAY}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  A direct consultation booking notification has been prepared for Advocate Eva Nduta Munene ({ADVOCATE_PHONE_DISPLAY}). Click below to confirm delivery or open in WhatsApp.
                </p>
                <div className="mt-3">
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs transition shadow-sm cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>Send / Open in WhatsApp ({ADVOCATE_PHONE_DISPLAY})</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {icsData && (
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Add to Calendar (.ics)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* CONSULTATION BOOKING FORM */
        <div className="p-6 sm:p-8 max-h-[88vh] overflow-y-auto">
          {/* Header */}
          <header className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-100 text-xs font-semibold uppercase tracking-wider mb-2.5">
              <ScaleIcon className="w-3.5 h-3.5 text-blue-800" />
              <span>Private Consultation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Schedule a Legal Consultation
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Reserve confidential legal advisory with Advocate Eva Nduta Munene and the ENM Legal team.
            </p>
          </header>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <ExclamationCircleIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="consultation-name"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="consultation-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grace Wanjiku"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="consultation-email"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="consultation-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. grace@company.co.ke"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition"
                  />
                </div>
              </div>
            </div>

            {/* Grid Row 2: Phone Number & Practice Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="consultation-phone"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="consultation-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +254 712 345 678"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="consultation-practice-area"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Legal Discipline
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <BriefcaseIcon className="w-4 h-4" />
                  </div>
                  <select
                    id="consultation-practice-area"
                    value={practiceArea}
                    onChange={(e) => setPracticeArea(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition cursor-pointer"
                  >
                    {PRACTICE_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Time Picker */}
            <div>
              <label
                htmlFor="consultation-datetime"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Preferred Date & Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 z-10">
                  <CalendarDaysIcon className="w-4 h-4" />
                </div>
                <DatePicker
                  id="consultation-datetime"
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  showTimeSelect
                  timeIntervals={30}
                  timeFormat="HH:mm"
                  dateFormat="EEEE, MMMM d, yyyy 'at' h:mm aa"
                  minDate={new Date()}
                  placeholderText="Click to select appointment date & time"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition cursor-pointer"
                />
              </div>
            </div>

            {/* Duration Segmented Pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Session Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = durationMinutes === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDurationMinutes(opt.value)}
                      className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm">{opt.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? "text-amber-300" : "text-slate-500"
                        }`}
                      >
                        {opt.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes / Details */}
            <div>
              <label
                htmlFor="consultation-notes"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Inquiry Summary / Key Questions <span className="text-slate-400 lowercase font-normal">(optional)</span>
              </label>
              <div className="relative">
                <textarea
                  id="consultation-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share a brief overview of your legal transaction, dispute, or question..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition resize-none"
                />
              </div>
            </div>

            {/* Legal Privilege Trust Signal */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[11px] leading-tight">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Protected under Kenyan Legal Professional Privilege. All disclosures remain strictly confidential.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition shadow-md shadow-slate-900/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Session...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Consultation</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default ConsultationModal;