import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rooms from '../data/rooms.json';
import { useBookingSystem } from './BookingSystem';
import { addDays, bestFitRoomSlug, getRoomCombinations, groupFitsRoom, minimumRoomsNeeded, today } from '../lib/availability';
import { consumeBookingFormFocus, FOCUS_EVENT_NAME } from '../lib/bookingNav';

const searchBarCss = `.premium-control{position:relative}.premium-trigger{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:40px;padding:5px 0 2px;border:0;background:transparent;color:#17140f;font:500 15px 'Playfair Display',serif;cursor:pointer;text-align:left}.premium-trigger .chev{font-size:10px;color:#9c7840;transition:transform .2s ease}.premium-trigger.open .chev{transform:rotate(180deg)}.premium-menu,.guest-menu{position:absolute;z-index:60;top:calc(100% + 8px);left:0;min-width:230px;background:#fdfaf3;border:1px solid #d9bd88;border-radius:10px;box-shadow:0 18px 40px rgba(48,35,20,.22);padding:6px;transform-origin:top;animation:premium-pop .18s ease both}.premium-option{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:11px 14px;border:0;background:transparent;border-radius:7px;color:#2b241c;font:14px 'DM Sans',sans-serif;text-align:left;cursor:pointer;transition:background .18s ease,color .18s ease}.premium-option:hover{background:#f0e4cf}.premium-option.selected{color:#8a5a1e;font-weight:600;background:#f3e9d7}.premium-option em{font-style:normal;color:#a07b42;font-size:11px}.premium-menu:before,.guest-menu:before{position:absolute;top:-5px;left:22px;width:10px;height:10px;background:#fdfaf3;border-top:1px solid #d9bd88;border-left:1px solid #d9bd88;content:'';transform:rotate(45deg)}@keyframes premium-pop{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}.guest-menu{min-width:264px;padding:12px 16px}.guest-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:9px 0}.guest-row+.guest-row{border-top:1px solid #eee2cd}.guest-label b{display:block;font:600 14px 'DM Sans',sans-serif;color:#2b241c}.guest-label small{font-size:10px;letter-spacing:.6px;color:#8d806f}.guest-stepper,.room-counter{display:flex;align-items:center;gap:12px}.guest-stepper button,.room-counter button{width:34px;height:34px;border:1px solid #cdbb9d;border-radius:50%;background:#fffaf2;color:#2b241c;font-size:16px;line-height:1;cursor:pointer;transition:transform .15s ease,background .15s ease,border-color .15s ease}.guest-stepper button:hover:not(:disabled),.room-counter button:hover:not(:disabled){background:#b7935a;border-color:#b7935a;color:#fff;transform:scale(1.06)}.guest-stepper button:disabled,.room-counter button:disabled{opacity:.35;cursor:not-allowed}.guest-stepper b,.room-counter b{min-width:22px;text-align:center;font:600 16px 'DM Sans',sans-serif;color:#17140f}.room-counter{min-height:40px;padding:5px 0 2px}.room-counter b{font:600 17px 'Playfair Display',serif}.booking.booking-standalone{margin:28px 8.5vw 56px;box-shadow:0 18px 50px rgba(46,30,13,.18)}.booking-highlight{animation:booking-glow 1.8s ease both}@keyframes booking-glow{0%{box-shadow:0 0 0 0 rgba(183,147,90,.6),0 18px 50px rgba(46,30,13,.18);outline:2px solid rgba(183,147,90,.85);outline-offset:0}35%{box-shadow:0 0 0 16px rgba(183,147,90,0),0 18px 50px rgba(46,30,13,.18);outline-color:rgba(230,194,132,.9);outline-offset:6px}70%{box-shadow:0 0 28px 5px rgba(183,147,90,.28),0 18px 50px rgba(46,30,13,.18)}100%{box-shadow:0 0 0 0 rgba(183,147,90,0),0 18px 50px rgba(46,30,13,.18);outline-color:rgba(183,147,90,0)}}.booking-recommend{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;width:100%;margin-top:6px;padding:13px 16px;border:1px solid rgba(183,147,90,.38);border-radius:10px;background:#fdf8ef;color:#5f5548;font-size:12px;line-height:1.65}.booking-recommend p{margin:0}.booking-recommend strong{color:#8a5a1e}.booking-recommend .recommend-apply{min-height:40px;padding:10px 16px;font-size:10px;border-radius:6px}@media(max-width:1050px){.booking.booking-standalone{margin:22px 6vw 44px}}@media(max-width:800px){.booking.booking-standalone{margin:16px 5vw 38px}.booking-recommend{flex-direction:column;align-items:stretch;text-align:left}.booking-recommend .recommend-apply{width:100%;justify-content:center}}@media(max-width:900px){.premium-menu,.guest-menu{min-width:min(300px,86vw)}.guest-stepper button,.room-counter button{width:44px;height:44px;font-size:18px}}@media(prefers-reduced-motion:reduce){.premium-menu,.guest-menu,.premium-trigger .chev,.booking-highlight{animation:none!important;transition:none!important}}`;

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    if (!ref.current) return undefined;
    const handle = event => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    const onKey = event => { if (event.key === 'Escape') onOutside(); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, onOutside]);
}

function PremiumSelect({ value, onChange, options, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const selected = options.find(option => option.value === value) || options[0];
  return <div className="premium-control" ref={ref}>
    <button type="button" className={`premium-trigger${open ? ' open' : ''}`} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(current => !current)}><span>{selected.label}</span><span className="chev">▼</span></button>
    {open && <div className="premium-menu" role="listbox" aria-label={ariaLabel}>{options.map(option => <button type="button" role="option" aria-selected={option.value === value} className={`premium-option${option.value === value ? ' selected' : ''}`} key={option.value || 'any'} onClick={() => { onChange(option.value); setOpen(false); }}><span>{option.label}{option.hint ? <em> — {option.hint}</em> : ''}</span>{option.value === value ? <span>✓</span> : null}</button>)}</div>}
  </div>;
}

function GuestField() {
  const { bookingDetails, updateBooking } = useBookingSystem();
  const { adults, children } = bookingDetails;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const summary = children === 0
    ? `${adults} Guest${adults > 1 ? 's' : ''}`
    : `${adults} Adult${adults > 1 ? 's' : ''} · ${children} Child${children > 1 ? 'ren' : ''}`;
  const setAdults = value => updateBooking({ adults: Math.max(1, value) });
  const setChildren = value => updateBooking({ children: Math.max(0, value) });
  return <div className="premium-control" ref={ref}>
    <button type="button" className={`premium-trigger${open ? ' open' : ''}`} aria-label="Select guests" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(current => !current)}><span>{summary}</span><span className="chev">▼</span></button>
    {open && <div className="guest-menu" role="dialog" aria-label="Select guests">
      <div className="guest-row"><div className="guest-label"><b>Adults</b><small>Minimum 1</small></div><div className="guest-stepper"><button type="button" aria-label="Remove adult" disabled={adults <= 1} onClick={() => setAdults(adults - 1)}>−</button><b aria-live="polite">{adults}</b><button type="button" aria-label="Add adult" onClick={() => setAdults(adults + 1)}>+</button></div></div>
      <div className="guest-row"><div className="guest-label"><b>Children</b><small>0-17 years</small></div><div className="guest-stepper"><button type="button" aria-label="Remove child" disabled={children <= 0} onClick={() => setChildren(children - 1)}>−</button><b aria-live="polite">{children}</b><button type="button" aria-label="Add child" onClick={() => setChildren(children + 1)}>+</button></div></div>
    </div>}
  </div>;
}

function RoomCounter() {
  const { bookingDetails, updateBooking } = useBookingSystem();
  const { roomCount } = bookingDetails;
  const setRooms = value => updateBooking({ roomCount: Math.min(6, Math.max(1, value)) });
  return <div className="room-counter">
    <button type="button" aria-label="Remove room" disabled={roomCount <= 1} onClick={() => setRooms(roomCount - 1)}>−</button>
    <b aria-live="polite">{roomCount}</b>
    <button type="button" aria-label="Add room" disabled={roomCount >= 6} onClick={() => setRooms(roomCount + 1)}>+</button>
  </div>;
}

function AvailabilitySearch() {
  const navigate = useNavigate();
  const { bookingDetails, updateBooking, setRoomPreference } = useBookingSystem();
  const [roomType, setRoomType] = useState('');
  const [message, setMessage] = useState('');

  const todayString = today();
  const { checkIn, checkOut, adults, children, roomCount } = bookingDetails;
  const minimumCheckOut = checkIn ? addDays(checkIn, 1) : todayString;

  useEffect(() => {
    const focusForm = () => {
      const form = document.getElementById('booking-form');
      if (!form) return;
      window.clearTimeout(focusForm.scrollTimer);
      window.clearTimeout(focusForm.highlightTimer);
      focusForm.scrollTimer = window.setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 90);
      form.classList.remove('booking-highlight');
      void form.offsetWidth;
      form.classList.add('booking-highlight');
      focusForm.highlightTimer = window.setTimeout(() => form.classList.remove('booking-highlight'), 2000);
    };
    if (consumeBookingFormFocus()) focusForm();
    window.addEventListener(FOCUS_EVENT_NAME, focusForm);
    return () => {
      window.removeEventListener(FOCUS_EVENT_NAME, focusForm);
      window.clearTimeout(focusForm.scrollTimer);
      window.clearTimeout(focusForm.highlightTimer);
    };
  }, []);

  const roomOptions = [{ value: '', label: 'Any room type', hint: 'show all available rooms' }, ...rooms.map(room => ({ value: room.slug, label: room.name, hint: `up to ${room.capacity} guests` }))];

  const totalGuests = adults + children;
  const prefRoom = roomType ? rooms.find(room => room.slug === roomType) : null;
  const prefFits = prefRoom ? groupFitsRoom(prefRoom, totalGuests, roomCount) : true;
  const roomsNeeded = minimumRoomsNeeded(rooms, totalGuests);
  const prefRoomsNeeded = prefRoom ? Math.max(1, Math.ceil(totalGuests / prefRoom.capacity)) : roomsNeeded;
  const anyComboFits = getRoomCombinations({ rooms, guests: totalGuests, roomCount, availableUnits: null }).length > 0;

  const capacityIssue = totalGuests > 0 && !(prefRoom ? prefFits : anyComboFits)
    ? prefRoom
      ? {
          text: roomCount === 1
            ? `${prefRoom.name} accommodates up to ${prefRoom.capacity} guest${prefRoom.capacity > 1 ? 's' : ''}.`
            : `${roomCount} × ${prefRoom.name} accommodate up to ${prefRoom.capacity * roomCount} guest${prefRoom.capacity * roomCount > 1 ? 's' : ''}.`,
          hint: `Please select ${prefRoomsNeeded} or more room${prefRoomsNeeded > 1 ? 's' : ''}, or choose a different room.`,
          useRooms: roomCount < prefRoomsNeeded ? prefRoomsNeeded : null,
        }
      : {
          text: roomCount === 1
            ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''} cannot be accommodated in one room.`
            : `No combination of ${roomCount} rooms can accommodate ${totalGuests} guest${totalGuests > 1 ? 's' : ''}.`,
          hint: `Your group needs at least ${roomsNeeded} room${roomsNeeded > 1 ? 's' : ''}.`,
          useRooms: roomCount < roomsNeeded ? roomsNeeded : null,
        }
    : null;

  const handleCheckIn = value => {
    updateBooking({ checkIn: value });
    if (!value) {
      updateBooking({ checkOut: '' });
      return;
    }
    const minCheckOut = addDays(value, 1);
    if (!checkOut || checkOut < minCheckOut) {
      updateBooking({ checkOut: minCheckOut });
    }
  };

  const search = event => {
    event.preventDefault();
    if (capacityIssue) {
      setMessage(`${capacityIssue.text} ${capacityIssue.hint}`);
      return;
    }
    if (!checkIn) {
      setMessage('Please select a check-in date.');
      return;
    }
    if (checkIn < todayString) {
      setMessage('Check-in cannot be in the past.');
      return;
    }
    if (!checkOut) {
      setMessage('Please select a check-out date.');
      return;
    }
    if (checkOut <= checkIn) {
      setMessage('Check-out must be at least one day after check-in.');
      return;
    }
    setMessage('');
    setRoomPreference(roomType);
    const targetSlug = roomType || bestFitRoomSlug(rooms, totalGuests);
    navigate(`/rooms/${targetSlug}`);
  };

  return <form id="booking-form" className="booking booking-standalone" onSubmit={search} aria-label="Check room availability">
    <style>{searchBarCss}</style>
    <div className="booking-field"><small>CHECK-IN</small><input type="date" min={todayString} value={checkIn} onChange={event => handleCheckIn(event.target.value)}/></div>
    <div className="booking-field"><small>CHECK-OUT</small><input type="date" min={minimumCheckOut} value={checkOut} onChange={event => updateBooking({ checkOut: event.target.value })}/></div>
    <div className="booking-field"><small>GUESTS</small><GuestField/></div>
    <div className="booking-field"><small>ROOMS</small><RoomCounter/></div>
    <div className="booking-field"><small>ROOM PREFERENCE</small><PremiumSelect value={roomType} onChange={setRoomType} options={roomOptions} ariaLabel="Room preference"/></div>
    <button className="gold-button" type="submit">EXPLORE THE ROOM <span>→</span></button>
    {message && <p className="booking-message" role="status">{message}</p>}
    {capacityIssue && <div className="booking-recommend" role="status"><p><strong>{capacityIssue.text}</strong> {capacityIssue.hint}</p>{capacityIssue.useRooms && <button type="button" className="gold-button recommend-apply" onClick={() => updateBooking({ roomCount: capacityIssue.useRooms })}>USE {capacityIssue.useRooms} ROOM{capacityIssue.useRooms > 1 ? 'S' : ''} <span>→</span></button>}</div>}
  </form>;
}

export default AvailabilitySearch;
