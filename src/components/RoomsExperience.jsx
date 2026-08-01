import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import rooms from '../data/rooms.json';
import './rooms-experience.css';
import standardImage from '../assets/rooms/standard-room.jpg';
import deluxeImage from '../assets/rooms/deluxe-room.jpg';
import suiteImage from '../assets/rooms/family-suite.jpg';
import logo from '../assets/logo/kps-inn-logo.png';
import { useBookingSystem } from './BookingSystem';

const roomImage = room => ({ standard: standardImage, deluxe: deluxeImage, 'family-suite': suiteImage })[room.slug];
function FacilityIcon({ name }) {
  const common = { viewBox: '0 0 24 24', width: '18', height: '18', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'Wi-Fi') return <svg {...common}><path d="M3 9c5.5-4.7 12.5-4.7 18 0"/><path d="M6 12c3.8-3.2 8.2-3.2 12 0"/><path d="M9 15c1.9-1.6 4.1-1.6 6 0"/><path d="M12 19h.01"/></svg>;
  if (name === 'TV') return <svg {...common}><rect x="3" y="5" width="18" height="13" rx="2"/><path d="M8 21h8M12 18v3"/></svg>;
  if (name === 'AC') return <svg {...common}><path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/><circle cx="12" cy="12" r="2"/></svg>;
  if (name === 'Parking Facility') return <svg {...common}><path d="M5 21V4h9a4 4 0 0 1 0 8H9"/><path d="M9 4v17"/></svg>;
  if (name === 'Tea') return <svg {...common}><path d="M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2M7 4v2M11 3v3"/></svg>;
  if (name === 'Bath') return <svg {...common}><path d="M4 12h16v5H4zM7 12V7a2 2 0 0 1 4 0"/><path d="M6 21v-4M18 21v-4"/></svg>;
  if (name === 'Family seating') return <svg {...common}><path d="M4 20v-7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7M3 20h18M7 10V6h10v4"/></svg>;
  return <svg {...common}><circle cx="12" cy="6" r="2"/><path d="M4 21v-7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7M8 21v-5h8v5"/></svg>;
}

function PageHeader() {
  return <header className="rooms-header"><Link className="details-brand" to="/"><img src={logo} alt="KPS INN logo"/><span><b>KPS INN</b><i>Comfortable rooms and friendly service</i></span></Link><nav><Link to="/">Home</Link><Link to="/#rooms">Rooms</Link></nav></header>;
}

function GuestSelector({ adults, setAdults, children, setChildren }) {
  return <div className="guest-selectors"><div className="guest-selector"><span>Adults</span><button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}>−</button><b>{adults}</b><button type="button" onClick={() => setAdults(adults + 1)}>+</button></div><div className="guest-selector"><span>Children</span><button type="button" onClick={() => setChildren(Math.max(0, children - 1))}>−</button><b>{children}</b><button type="button" onClick={() => setChildren(children + 1)}>+</button></div></div>;
}

export function RoomDetailsPage({ slug }) {
  const room = rooms.find(item => item.slug === slug) || rooms[0];
  const navigate = useNavigate();
  const { openBooking, bookingDetails, updateBooking, setSelectedRoom } = useBookingSystem();
  const { adults, children, roomCount, checkIn, checkOut, promoCode } = bookingDetails;
  const setAdults = value => updateBooking({ adults: value });
  const setChildren = value => updateBooking({ children: value });
  const setRoomCount = value => updateBooking({ roomCount: value });
  const tax = Math.round(room.price * 0.12);
  const total = (room.price + tax) * roomCount;
  useEffect(() => { setSelectedRoom(room.name); }, [room.name, setSelectedRoom]);
  useEffect(() => {
    const gallery = document.querySelector('.room-gallery');
    if (!gallery) return undefined;
    const price = document.createElement('span');
    price.className = 'room-gallery-price';
    price.innerHTML = `From <b>Rs. ${room.price.toLocaleString('en-IN')}</b> <small>/ night</small>`;
    gallery.appendChild(price);
    return () => price.remove();
  }, [room.price]);
  useEffect(() => {
    const form = document.querySelector('.sticky-book');
    if (!form) return undefined;
    const [checkInInput, checkOutInput, promoInput] = form.querySelectorAll('input');
    checkInInput.value = checkIn;
    checkOutInput.value = checkOut;
    promoInput.value = promoCode;
    const syncCheckIn = event => updateBooking({ checkIn: event.target.value });
    const syncCheckOut = event => updateBooking({ checkOut: event.target.value });
    const syncPromo = event => updateBooking({ promoCode: event.target.value });
    checkInInput.addEventListener('change', syncCheckIn);
    checkOutInput.addEventListener('change', syncCheckOut);
    promoInput.addEventListener('input', syncPromo);
    return () => { checkInInput.removeEventListener('change', syncCheckIn); checkOutInput.removeEventListener('change', syncCheckOut); promoInput.removeEventListener('input', syncPromo); };
  }, [checkIn, checkOut, promoCode, updateBooking]);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [slug]);
  return <><PageHeader/><main className="details-page"><div className="details-main"><Link className="breadcrumb" to="/#rooms">← ALL ROOMS</Link><div className="room-gallery"><img src={roomImage(room)} alt={room.name}/></div><p className="eyebrow dark">KPS INN ACCOMMODATION</p><h1>{room.name}</h1><p className="details-lead">{room.description}</p><section className="detail-card"><h2>Room highlights</h2><div className="highlight-grid">{room.highlights.map(item => <p key={item}>✦ {item}</p>)}</div></section><section className="detail-card amenities-policy-card"><div className="amenities-heading"><div><p className="eyebrow dark">YOUR COMFORT</p><h2>Room amenities</h2></div><span>Included with your stay</span></div><div className="amenities-grid">{room.facilities.map(item => <div className="amenity-item" key={item}><span className="facility-symbol"><FacilityIcon name={item}/></span><span>{item}</span></div>)}</div><div className="policy-panel"><div><p className="eyebrow dark">STAY WITH CONFIDENCE</p><h3>Hotel policies</h3></div><div className="policy-list"><p><span>✓</span>Flexible cancellation terms confirmed by reception.</p><p><span>✓</span>24-hour reception for guest assistance.</p></div></div></section><section className="detail-card"><h2>Guest reviews</h2><p className="review">★ {room.rating}/5 — Guests value the clean rooms, comfort, and friendly service at KPS INN.</p></section><section className="detail-card"><h2>Related rooms</h2><div className="related">{rooms.filter(item => item.slug !== room.slug).map(item => <button type="button" key={item.slug} onClick={() => navigate(`/room/${item.slug}`)}>{item.name} →</button>)}</div></section></div><aside className="sticky-book"><p className="eyebrow dark">BOOK YOUR STAY</p><h2>{room.name}</h2><label>Check-in<input type="date"/></label><label>Check-out<input type="date"/></label><GuestSelector adults={adults} setAdults={setAdults} children={children} setChildren={setChildren}/><label>Number of rooms<select value={roomCount} onChange={event => setRoomCount(Number(event.target.value))}><option value="1">1 Room</option><option value="2">2 Rooms</option><option value="3">3 Rooms</option></select></label><label>Promo code<input placeholder="Optional"/></label><div className="price-summary"><p>Room price <b>Rs. {(room.price * roomCount).toLocaleString('en-IN')}</b></p><p>Taxes <b>Rs. {(tax * roomCount).toLocaleString('en-IN')}</b></p><strong>Total <b>Rs. {total.toLocaleString('en-IN')}</b></strong></div><button className="gold-button" onClick={() => openBooking(room.name)}>BOOK NOW →</button></aside></main></>;
}
