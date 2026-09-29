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
        className="absolute top-5 right-5 z-20 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
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