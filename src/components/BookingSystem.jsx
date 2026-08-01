import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [bookingDetails, setBookingDetails] = useState({ checkIn: '', checkOut: '', adults: 1, children: 0, roomCount: 1, promoCode: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const openBooking = room => {
    if (room) setSelectedRoom(room);
    setSent(false);
    setIsOpen(true);
  };
  const closeBooking = () => {
    setIsOpen(false);
    setSent(false);
  };
  const updateBooking = changes => setBookingDetails(current => ({ ...current, ...changes }));
  return <BookingContext.Provider value={{ selectedRoom, setSelectedRoom, bookingDetails, updateBooking, openBooking, closeBooking, isOpen, sent, setSent }}>{children}</BookingContext.Provider>;
}

export function useBookingSystem() {
  const booking = useContext(BookingContext);
  if (!booking) throw new Error('useBookingSystem must be used inside BookingProvider');
  return booking;
}

export function BookingPopup() {
  const { selectedRoom, isOpen, sent, setSent, closeBooking } = useBookingSystem();
  if (!isOpen) return null;
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Complete your booking"><div className="modal"><button className="close" onClick={closeBooking}>×</button>{sent ? <div className="confirmation"><span>✓</span><h2>Thank you.</h2><p>Your booking request for {selectedRoom || 'your stay'} has been recorded. Our team will confirm availability as soon as possible.</p><button className="gold-button" onClick={closeBooking}>DONE</button></div> : <><p className="eyebrow dark">GUEST DETAILS</p><h2>Complete your <i>booking.</i></h2>{selectedRoom && <p className="booking-confirmation">Selected room: <strong>{selectedRoom}</strong></p>}<form onSubmit={event => { event.preventDefault(); setSent(true); }}><label>Guest Name<input required placeholder="Enter your name"/></label><label>Phone Number<input required type="tel" placeholder="Enter your phone number"/></label><label>Email<input required type="email" placeholder="Enter your email"/></label><label>Special Request<textarea placeholder="Any special request"/></label><button className="gold-button">CONFIRM BOOKING <span>→</span></button></form></>}</div></div>;
}
