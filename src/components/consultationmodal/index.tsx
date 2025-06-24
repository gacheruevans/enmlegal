import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ConsultationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onRequestClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !email) return;

    // Call your backend API to create the Google Calendar event
    await fetch("/api/book-consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        applicantEmail: email,
      }),
    });

    alert("Consultation booked! You will receive an email invite.");
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Book Consultation"
      ariaHideApp={false}
      className="bg-white p-8 rounded shadow-lg max-w-md mx-auto mt-32"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4">Book a Consultation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Your Email:
          <input
            type="email"
            className="block w-full border p-2 mt-1"
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
            className="block w-full border p-2 mt-1"
            minDate={new Date()}
            required
          />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-royal text-white rounded">Book</button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsultationModal;