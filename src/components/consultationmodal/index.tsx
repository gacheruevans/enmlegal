import emailjs from "@emailjs/browser";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";

interface ConsultationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onRequestClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ meetLink?: string; start?: string; end?: string } | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [icsData, setIcsData] = useState<string | null>(null);

  const generateIcs = (start: Date, durationMinutes: number, name: string, email: string) => {
    const end = new Date(start.getTime() + durationMinutes * 60000);
    // Use local timezone name if available (Intl API); fallback to UTC
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    // Format in YYYYMMDDTHHMMSS form (local time for TZ usage)
    const fmtLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    };
    const dtStartLocal = fmtLocal(start);
    const dtEndLocal = fmtLocal(end);
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@enmlegal`;
    const summary = `Consultation Request from ${name || email}`;
    const description = `Consultation requested by ${name || email} for ${start.toString()}`;
    // Minimal VTIMEZONE block (simplified, not accounting for DST changes thoroughly)
    const vtimezone = `BEGIN:VTIMEZONE\nTZID:${tz}\nEND:VTIMEZONE`;
    return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ENMLegal//Consultation//EN\n${vtimezone}\nBEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${dtStartLocal}Z\nDTSTART;TZID=${tz}:${dtStartLocal}\nDTEND;TZID=${tz}:${dtEndLocal}\nSUMMARY:${summary}\nDESCRIPTION:${description}\nEND:VEVENT\nEND:VCALENDAR`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !email || !durationMinutes) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setIcsData(null);
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS environment variables missing');
      }
      const startLocal = selectedDate.toLocaleString();
      const endLocal = new Date(selectedDate.getTime() + durationMinutes * 60000).toLocaleString();
      const templateParams = {
        sender_name: name || 'Anonymous',
        sender_email: email,
        consultation_datetime: `${startLocal} - ${endLocal}`,
        message: `Consultation request from ${name || email} for ${startLocal} (${durationMinutes} min)`,
      };
      await emailjs.send(serviceId, templateId, templateParams, { publicKey });
      const ics = generateIcs(selectedDate, durationMinutes, name || 'Anonymous', email);
      setIcsData(ics);
      setResult({ start: selectedDate.toISOString(), end: new Date(selectedDate.getTime() + durationMinutes*60000).toISOString(), meetLink: undefined });
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Book Consultation"
      ariaHideApp={false}
      className="max-w-md p-8 mx-auto mt-32 bg-white rounded shadow-lg"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <h2 className="mb-4 text-xl font-bold">Book a Consultation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded">{error}</div>}
        {result && icsData && (
          <div className="p-2 text-sm text-green-800 bg-green-100 border border-green-300 rounded">
            Consultation request sent! {result.start && <span>Start: {new Date(result.start).toLocaleString()}.</span>} Duration: {durationMinutes} min.{' '}
            <button
              type="button"
              className="ml-2 underline text-green-900"
              onClick={() => {
                const blob = new Blob([icsData], { type: 'text/calendar' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'consultation.ics';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >Download Calendar Invite</button>
          </div>
        )}
        <label className="block">
          Your Name (optional):
          <input
            type="text"
            className="block w-full p-2 mt-1 border"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </label>
        <label className="block">
          Your Email:
          <input
            type="email"
            className="block w-full p-2 mt-1 border"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          Select Date & Time:
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            showTimeSelect
            timeIntervals={30}
            dateFormat="Pp"
            className="block w-full p-2 mt-1 border"
            minDate={new Date()}
            required
          />
        </label>
        <label className="block">
          Duration (minutes):
          <select
            className="block w-full p-2 mt-1 border"
            value={durationMinutes}
            onChange={e => setDurationMinutes(Number(e.target.value))}
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
            <option value={60}>60</option>
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 rounded" disabled={loading}>Cancel</button>
          <button type="submit" className="px-4 py-2 text-white rounded bg-royal disabled:opacity-60" disabled={loading}>{loading ? 'Booking...' : 'Book'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsultationModal;