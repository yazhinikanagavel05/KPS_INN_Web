import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import rooms from '../data/rooms.json';
import './rooms-experience.css';
import standardImage from '../assets/rooms/standard-room.jpg';
import deluxeImage from '../assets/rooms/deluxe-room.jpg';
import suiteImage from '../assets/rooms/family-suite.jpg';
import logo from '../assets/logo/kps-inn-logo.png';
import { useBookingSystem } from './BookingSystem';

const roomImage = room => ({ standard: standardImage, deluxe: deluxeImage, 'family-suite': suiteImage })[room.slug];

function RoomsHeader() {
  return <header className="rooms-header"><Link className="details-brand" to="/"><img src={logo} alt="KPS INN logo"/><span><b>KPS INN</b><i>Comfortable rooms and friendly service</i></span></Link><nav><Link to="/">Home</Link><Link to="/rooms">Rooms</Link></nav></header>;
}

function RoomsPage() {
  const { bookingDetails, updateBooking } = useBookingSystem();
  const [guestFilter, setGuestFilter] = useState(bookingDetails.adults);
  const [status, setStatus] = useState('');

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, []);

  const filteredRooms = useMemo(() => rooms.filter(room => room.maxGuests >= guestFilter), [guestFilter]);
  const noRoomsMessage = filteredRooms.length ? '' : 'No rooms match this guest count.';
  const staySummary = bookingDetails.checkIn && bookingDetails.checkOut ? `${bookingDetails.checkIn} to ${bookingDetails.checkOut} / ${guestFilter} Guest${guestFilter > 1 ? 's' : ''}` : `${guestFilter} Guest${guestFilter > 1 ? 's' : ''}`;

  const applyFilter = () => {
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
      setStatus('Select check-in and check-out dates to continue.');
      return;
    }
    if (bookingDetails.checkOut <= bookingDetails.checkIn) {
      setStatus('Check-out must be after check-in.');
      return;
    }
    setStatus('');
    const list = document.querySelector('#room-list');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <>
    <RoomsHeader />
    <main className="section rooms-page" id="rooms">
      <section className="rooms-page-hero">
        <div className="section-title"><div><p className="eyebrow dark">AVAILABLE FOR YOUR STAY</p><h2>Select your <i>room.</i></h2></div><p className="flow-summary">{staySummary}</p></div>
      </section>
      <section className="detail-card rooms-page-filters">
        <div className="filter-field"><label>Check-in<input type="date" value={bookingDetails.checkIn} onChange={e => updateBooking({ checkIn: e.target.value })}/></label></div>
        <div className="filter-field"><label>Check-out<input type="date" min={bookingDetails.checkIn || undefined} value={bookingDetails.checkOut} onChange={e => updateBooking({ checkOut: e.target.value })}/></label></div>
        <div className="filter-field"><label>Guests<select value={guestFilter} onChange={e => setGuestFilter(Number(e.target.value))}><option value={1}>1 Guest</option><option value={2}>2 Guests</option><option value={3}>3 Guests</option><option value={4}>4 Guests</option></select></label></div>
        <button className="gold-button" type="button" onClick={applyFilter}>FILTER ROOMS <span>-&gt;</span></button>
        {(status || noRoomsMessage) && <p className="booking-message" role="status">{status || noRoomsMessage}</p>}
      </section>
      <div id="room-list" className="room-grid premium-room-grid">
        {filteredRooms.map((room, index) => <article className="room-card premium-room-card" key={room.slug}><div className="room-image"><img src={roomImage(room)} alt={room.name}/><span>0{index + 1}</span><b className="room-score">★ {room.rating}</b></div><div className="room-info"><div><h3>{room.name}</h3><p>{room.description}</p></div><div className="price"><small>FROM</small><b>Rs. {room.price.toLocaleString('en-IN')}</b><em>/ NIGHT</em></div></div><div className="room-specs"><span><b>Bed</b>{room.bedType}</span><span><b>Guests</b>Up to {room.maxGuests}</span><span><b>Space</b>{room.size}</span></div><div className="room-facilities">{room.facilities.map(facility => <span key={facility}>{facility}</span>)}</div><Link className="room-link view-details" to={`/rooms/${room.slug}`}>VIEW DETAILS <span>→</span></Link></article>) }
      </div>
    </main>
  </>;
}

export default RoomsPage;
