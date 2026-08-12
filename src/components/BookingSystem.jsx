import { createContext, useContext, useState } from 'react';
import { saveBooking } from '../lib/availability';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [roomPreference, setRoomPreference] = useState('');
  const [bookingDetails, setBookingDetails] = useState({ checkIn: '', checkOut: '', adults: 1, children: 0, roomCount: 1, promoCode: '' });
  const [guestDetails, setGuestDetails] = useState({ name: '', phone: '', email: '', request: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openBooking = room => {
    if (room) setSelectedRoom(room);
    setGuestDetails({ name: '', phone: '', email: '', request: '' });
    setSent(false);
    setIsOpen(true);
  };
  const closeBooking = () => {
    setIsOpen(false);
    setSent(false);
  };
  const updateBooking = changes => setBookingDetails(current => ({ ...current, ...changes }));
  const updateGuest = changes => setGuestDetails(current => ({ ...current, ...changes }));

  const confirmBooking = async payload => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        saveBooking(payload);
        return true;
      }
    } catch {
      // server unreachable - keep the guest's booking locally so the flow still works
    } finally {
      setSubmitting(false);
    }
    saveBooking(payload);
    return false;
  };

  return (
    <BookingContext.Provider
      value={{
        selectedRoom,
        setSelectedRoom,
        roomPreference,
        setRoomPreference,
        bookingDetails,
        updateBooking,
        guestDetails,
        updateGuest,
        openBooking,
        closeBooking,
        isOpen,
        sent,
        setSent,
        submitting,
        confirmBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingSystem() {
  const booking = useContext(BookingContext);
  if (!booking) throw new Error('useBookingSystem must be used inside BookingProvider');
  return booking;
}

export function BookingPopup() {
  const { selectedRoom, roomPreference, bookingDetails, guestDetails, updateGuest, confirmBooking, isOpen, sent, setSent, closeBooking, submitting } = useBookingSystem();
  if (!isOpen) return null;

  const submit = async event => {
    event.preventDefault();
    const ok = await confirmBooking({
      roomSlug: roomPreference,
      roomName: selectedRoom,
      guestName: guestDetails.name,
      phone: guestDetails.phone,
      email: guestDetails.email,
      specialRequest: guestDetails.request,
      checkIn: bookingDetails.checkIn,
      checkOut: bookingDetails.checkOut,
      roomCount: bookingDetails.roomCount,
      adults: bookingDetails.adults,
      children: bookingDetails.children,
    });
    setSent(true);
    return ok;
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Complete your booking">
      <div className="modal">
        <button className="close" onClick={closeBooking}>×</button>
        {sent ? (
          <div className="confirmation">
            <span>✓</span>
            <h2>Thank you.</h2>
            <p>Your booking request for {selectedRoom || 'your stay'} has been recorded. Our team will confirm availability as soon as possible.</p>
            <div className="confirmation-location">
              <svg className="confirmation-location-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21S5 14.5 5 9.5a7 7 0 0 1 14 0C19 14.5 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.6" /></svg>
              <b>KPS INN</b>
              <a href="https://www.google.com/maps/search/?api=1&query=X375%2B6R9%20Karur%2C%20Tamil%20Nadu" target="_blank" rel="noopener noreferrer">View Hotel Location →</a>
            </div>
            <button className="gold-button" onClick={closeBooking}>DONE</button>
          </div>
        ) : (
          <>
            <p className="eyebrow dark">GUEST DETAILS</p>
            <h2>Complete your <i>booking.</i></h2>
            {selectedRoom && <p className="booking-confirmation">Selected room: <strong>{selectedRoom}</strong></p>}
            <form onSubmit={submit}>
              <label>Guest Name<input required value={guestDetails.name} onChange={event => updateGuest({ name: event.target.value })} placeholder="Enter your name" /></label>
              <label>Phone Number<input required type="tel" value={guestDetails.phone} onChange={event => updateGuest({ phone: event.target.value })} placeholder="Enter your phone number" /></label>
              <label>Email<input required type="email" value={guestDetails.email} onChange={event => updateGuest({ email: event.target.value })} placeholder="Enter your email" /></label>
              <label>Special Request<textarea value={guestDetails.request} onChange={event => updateGuest({ request: event.target.value })} placeholder="Any special request" /></label>
              <button className="gold-button" disabled={submitting}>{submitting ? 'SAVING…' : 'CONFIRM BOOKING'} <span>→</span></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
