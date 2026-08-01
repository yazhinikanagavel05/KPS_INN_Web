import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import './styles.css';
import './booking.css';
import { RoomDetailsPage } from './components/RoomsExperience';
import { BookingPopup, BookingProvider, useBookingSystem } from './components/BookingSystem';
import './components/room-card-alignment.css';
import SplashScreen from './components/SplashScreen';
import logo from './assets/logo/kps-inn-logo.png';
import standardRoom from './assets/rooms/standard-room.jpg';
import deluxeRoom from './assets/rooms/deluxe-room.jpg';
import familySuite from './assets/rooms/family-suite.jpg';
import reception from './assets/gallery/hero-luxury.png';
import hotelRoom from './assets/gallery/hotel-room.jpg';
import bedroomInterior from './assets/gallery/bedroom-interior.jpg';
import hotelBuilding from './assets/gallery/hotel-building.jpg';
import restaurantDining from './assets/gallery/restaurant-dining.jpg';
import hotelLobby from './assets/gallery/hotel-lobby.jpg';
import comfortRoom from './assets/gallery/comfort-room.jpg';
import premiumSuite from './assets/gallery/premium-suite.jpg';
import executiveLounge from './assets/gallery/executive-lounge.jpg';
import luxuryBathroom from './assets/gallery/luxury-bathroom.jpg';
import poolLayout from './assets/gallery/pool-layout.jpg';

const rooms = [
  { slug: 'standard', name: 'Standard Room', price: 'Rs. 1,499', description: 'A practical and comfortable room for short stays, solo travelers, and business visits.', facilities: [['◉', 'Free WiFi'], ['❄', 'Air Conditioning'], ['▣', 'Smart TV'], ['◈', 'Parking']], bedType: 'Comfortable bedding', capacity: 2, size: 'Comfortable stay', rating: '4.6', image: standardRoom },
  { slug: 'deluxe', name: 'Deluxe Room', price: 'Rs. 2,199', description: 'A larger room with upgraded comfort, soft bedding, and a calm setting for relaxation.', facilities: [['◉', 'Free WiFi'], ['☕', 'Tea service'], ['◌', 'Bath amenities'], ['◈', 'Parking']], bedType: 'Soft bedding', capacity: 2, size: 'Spacious comfort', rating: '4.7', image: deluxeRoom },
  { slug: 'family-suite', name: 'Family Suite', price: 'Rs. 3,499', description: 'Spacious accommodation for families and groups who need extra room and convenience.', facilities: [['◒', 'Family seating'], ['◈', 'Dining space'], ['◉', 'Free WiFi'], ['◈', 'Parking']], bedType: 'Family accommodation', capacity: 4, size: 'Extra room for families', rating: '4.8', image: familySuite },
];
const gallery = [hotelRoom, bedroomInterior, hotelBuilding, restaurantDining, hotelLobby, comfortRoom, premiumSuite, executiveLounge, luxuryBathroom, poolLayout];
const Icon = ({ children }) => <span className="icon" aria-hidden="true">{children}</span>;

function Booking({ selected, onSelect, onAvailable }) {
  const { bookingDetails, updateBooking, openBooking } = useBookingSystem();
  const { adults: guests, checkIn, checkOut } = bookingDetails;
  const [available, setAvailable] = useState(rooms);
  const [message, setMessage] = useState('');
  const checkAvailability = () => {
    if (!checkIn || !checkOut) return setMessage('Please select check-in and check-out dates.');
    if (checkOut <= checkIn) return setMessage('Check-out must be after check-in.');
    const matches = rooms.filter(room => room.capacity >= guests);
    setAvailable(matches);
    if (!matches.length) return setMessage('No rooms are available for this guest count.');
    setMessage('');
    onAvailable({ checkIn, checkOut, guests, rooms: matches });
  };
  return <section className="booking" id="booking" aria-label="Book your stay">
    <label className="booking-field"><small>CHECK IN</small><input aria-label="Check in date" type="date" value={checkIn} onChange={event => { updateBooking({ checkIn: event.target.value }); setAvailable([]); onSelect(''); }}/></label>
    <label className="booking-field"><small>CHECK OUT</small><input aria-label="Check out date" type="date" min={checkIn || undefined} value={checkOut} onChange={event => { updateBooking({ checkOut: event.target.value }); setAvailable([]); onSelect(''); }}/></label>
    <div className="booking-field"><small>GUESTS</small><strong>{guests} <em>Guest{guests > 1 ? 's' : ''}</em></strong><div className="guest-control"><button onClick={() => { updateBooking({ adults: Math.max(1, guests - 1) }); setAvailable([]); onSelect(''); }}>-</button><button onClick={() => { updateBooking({ adults: guests + 1 }); setAvailable([]); onSelect(''); }}>+</button></div></div>
    <label className="booking-field room-select"><small>ROOM</small><select aria-label="Room type" value={selected} onChange={event => onSelect(event.target.value)}><option value="">Select room</option>{rooms.map(room => <option value={room.name} key={room.name}>{room.name} — {room.price}</option>)}</select></label>
    <button className="gold-button" onClick={checkAvailability}>CHECK AVAILABILITY <span>-&gt;</span></button>
    {message && <p className="booking-message" role="status">{message}</p>}
  </section>;
}

function App() {
  const [scrolled, setScrolled] = useState(false); const [menu, setMenu] = useState(false); const [chosen, setChosen] = useState(''); const modal = false; const [sent, setSent] = useState(false); const [lightbox, setLightbox] = useState(null); const [availability, setAvailability] = useState(null);
  const { openBooking } = useBookingSystem();
  const location = useLocation();
  const setModal = () => openBooking(chosen);
  useEffect(() => { const handler = () => setScrolled(scrollY > 30); addEventListener('scroll', handler); return () => removeEventListener('scroll', handler); }, []);
  useEffect(() => { if (location.pathname === '/rooms') requestAnimationFrame(() => document.querySelector('#rooms')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }, [location.pathname]);
  useEffect(() => { if (availability && chosen && availability.rooms.some(room => room.name === chosen)) { setAvailability(null); openBooking(chosen); } }, [availability, chosen, openBooking]);
  const choose = () => {
    const bookingForm = document.querySelector('#booking');
    if (!bookingForm) return;
    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    bookingForm.classList.add('booking-focus');
    setTimeout(() => bookingForm.classList.remove('booking-focus'), 1400);
  };
  const close = () => { setModal(false); setSent(false); };
  return <>
    <header className={scrolled ? 'scrolled' : ''}>
      <a className="brand" href="#top" aria-label="KPS INN home"><img className="hotel-logo" src={logo} alt="KPS INN logo"/><span><b>KPS INN</b><i>Comfortable rooms and friendly service</i></span></a>
      <button className="hamburger" onClick={() => setMenu(!menu)} aria-label="Toggle menu">Menu</button>
      <nav className={menu ? 'open' : ''}>{['Home', 'About', 'Rooms', 'Gallery', 'Booking', 'Contact'].map(item => <a onClick={() => setMenu(false)} href={`#${item.toLowerCase()}`} key={item}>{item}</a>)}<button onClick={() => { setMenu(false); choose(); }}>BOOK NOW <span>-&gt;</span></button></nav>
    </header>
    <main id="top">
      <section className="hero"><div className="hero-image" style={{ backgroundImage: `url(${reception})` }}></div><div className="hero-shade"></div><div className="hero-copy"><p className="eyebrow">COMFORTABLE ROOMS AND FRIENDLY SERVICE</p><h1>KPS INN<br/><i>Karur, Tamil Nadu.</i></h1><p className="intro">Clean rooms, dependable hospitality, and a peaceful stay for families, business travelers, and guests visiting Tamil Nadu.</p><Link className="outline-button" to="/rooms">VIEW ROOMS <span>↓</span></Link></div><div className="hero-side"><span>SCROLL TO DISCOVER</span><b>01 <i>/ 06</i></b></div></section>
      <Booking selected={chosen} onSelect={setChosen} onAvailable={setAvailability}/>
      <section className="section about-luxury" id="about"><div className="about-copy"><p className="about-kicker">KPS INN</p><p className="eyebrow dark">ABOUT US</p><h2>Warm hospitality<br/><i>for every guest.</i></h2><p>KPS INN offers welcoming accommodation for guests who value comfort, cleanliness, and quick access to nearby travel and city needs. The residency is suitable for families, business travelers, and visitors looking for a peaceful room after a long day.</p><div className="about-features"><div className="about-feature"><b>Clean Rooms</b><span>Rooms are prepared with care so guests can settle in with confidence.</span></div><div className="about-feature"><b>24 Hour Reception</b><span>Our team is available for booking questions, check-in help, and guest needs.</span></div></div><a className="text-link" href="#contact">CONTACT US <span>-&gt;</span></a></div><div className="about-visual"><img src={hotelLobby} alt="KPS INN reception and guest space"/><div className="about-badge">Comfort.<br/>Cleanliness.<br/>Care.</div></div></section>
      <section className="image-break"><img src={hotelBuilding} alt="KPS INN guest space"/><div><p>SIMPLE SERVICE, DONE WELL</p><h2>Clean rooms.<br/><i>Clear communication.</i></h2></div></section>
      <section className="rooms section" id="rooms"><div className="section-title"><div><p className="eyebrow dark">ACCOMMODATION</p><h2>Our rooms,<br/><i>your comfort.</i></h2></div><p>Three thoughtfully prepared room categories, with everything needed for a relaxed stay in Karur.</p></div><div className="room-grid premium-room-grid">{rooms.map((room, i) => <article className="room-card premium-room-card" key={room.name}><div className="room-image"><img src={room.image} alt={room.name}/><span>0{i + 1}</span><b className="room-score">★ {room.rating}</b></div><div className="room-info"><div><h3>{room.name}</h3><p>{room.description}</p></div><div className="price"><small>FROM</small><b>{room.price}</b><em>/ NIGHT</em></div></div><div className="room-specs"><span><b>Bed</b>{room.bedType}</span><span><b>Guests</b>Up to {room.capacity}</span><span><b>Space</b>{room.size}</span></div><div className="room-facilities">{room.facilities.map(([icon, label]) => <span key={label}><i>{icon}</i>{label}</span>)}</div><Link className="room-link view-details" to={`/room/${room.slug}`}>VIEW DETAILS <span>→</span></Link></article>)}</div></section>
      <section className="amenities"><div className="amenity-photo" style={{ backgroundImage: `url(${poolLayout})` }}></div><div className="amenity-copy"><p className="eyebrow">GUEST COMFORTS</p><h2>Useful amenities,<br/><i>thoughtfully provided.</i></h2><div className="amenity-list"><p><Icon>*</Icon> Free Wi-Fi</p><p><Icon>*</Icon> Parking Facility</p><p><Icon>*</Icon> Guest Support</p><p><Icon>*</Icon> Clean Rooms</p><p><Icon>*</Icon> 24 Hour Reception</p></div><a className="outline-button" href="#contact">CONTACT OUR TEAM <span>-&gt;</span></a></div></section>
      <section className="gallery section" id="gallery"><div className="section-title"><div><p className="eyebrow dark">PHOTOS</p><h2>Explore <i>KPS INN.</i></h2></div><p>Browse room interiors, guest spaces, and details that make the stay relaxed and convenient.</p></div><div className="gallery-grid-luxury">{gallery.map((image, index) => <img loading="lazy" src={image} onClick={() => setLightbox(index)} alt={`KPS INN gallery ${index + 1}`} key={image}/>)}</div></section>
      <section className="quote"><p className="eyebrow dark">KPS INN</p><blockquote>“Our team focuses on simple service done well: clean rooms, clear communication, and a stay that feels relaxed.”</blockquote><p className="guest">KARUR, TAMIL NADU</p></section>
      <section className="contact-cta section" id="contact"><p className="eyebrow dark">RESERVE YOUR ROOM</p><h2>Plan a comfortable<br/><i>stay.</i></h2><p className="contact-summary">Check-in: 12:00 PM &nbsp; / &nbsp; Check-out: 11:00 AM<br/>+91 99449 32516</p><button className="gold-button" onClick={choose}>REQUEST BOOKING <span>-&gt;</span></button></section>
    </main>
    <footer><div className="footer-brand"><img className="crest" src={logo} alt="KPS INN logo"/><b>KPS INN</b><i>Comfortable rooms and friendly service</i></div><div><p>CONTACT</p><a href="tel:+919944932516">+91 99449 32516</a><a href="https://www.google.com/maps/search/?api=1&query=X375%2B6R9%20Karur%2C%20Tamil%20Nadu" target="_blank" rel="noreferrer">View Location ↗</a></div><div><p>VISIT</p><address>#5/285/1, Ashok Nagar,<br/>Kovai Road, Karur-639002.</address></div><div><p>RECEPTION</p><span>Open 24 hours for guest assistance.</span><p>GST No: 33AHUPA9066B4ZB</p></div><small>© 2026 KPS INN. ALL RIGHTS RESERVED.</small></footer>
    <a href="tel:+919944932516" className="whatsapp" aria-label="Call KPS INN">☎</a>
    {availability && <div className="flow-backdrop" role="dialog" aria-modal="true" aria-label="KPS INN booking flow"><section className="booking-flow"><button className="close" onClick={() => setAvailability(null)}>×</button><div className="flow-steps"><b>1 <span>STAY DETAILS</span></b><b className="active">2 <span>SELECT ROOM</span></b><b>3 <span>CHOOSE RATE</span></b></div>{!chosen || !availability.rooms.some(room => room.name === chosen) ? <><p className="eyebrow dark">AVAILABLE FOR YOUR STAY</p><h2>Select your <i>room.</i></h2><p className="flow-summary">{availability.checkIn} to {availability.checkOut} &nbsp; / &nbsp; {availability.guests} Guest{availability.guests > 1 ? 's' : ''}</p><div className="flow-room-list">{availability.rooms.map(room => <article key={room.name}><img src={room.image} alt={room.name}/><div><h3>{room.name}</h3><p>{room.description}</p><span>{room.features}</span></div><div><small>FROM</small><b>{room.price}</b><button onClick={() => setChosen(room.name)}>SELECT ROOM</button></div></article>)}</div></> : <><p className="eyebrow dark">RATE OPTIONS</p><h2>{chosen}<br/><i>Choose your rate.</i></h2><div className="rate-list"><article><div><h3>Room Only</h3><p>Comfortable accommodation for your selected stay.</p></div><b>{rooms.find(room => room.name === chosen)?.price}<small>/ NIGHT</small></b><button onClick={() => { setAvailability(null); setModal(true); }}>BOOK NOW</button></article><article><div><h3>Room with Breakfast</h3><p>Room stay with breakfast included for your guests.</p></div><b>{`Rs. ${(Number(rooms.find(room => room.name === chosen)?.price.replace(/[^0-9]/g, '')) + 300).toLocaleString('en-IN')}`}<small>/ NIGHT</small></b><button onClick={() => { setAvailability(null); setModal(true); }}>BOOK NOW</button></article></div><button className="back-flow" onClick={() => setChosen('')}>← CHANGE ROOM</button></>}</section></div>}
    {modal && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Complete your booking"><div className="modal"><button className="close" onClick={close}>×</button>{sent ? <div className="confirmation"><span>*</span><h2>Thank you.</h2><p>Your booking request for {chosen} has been recorded. Our team will confirm availability as soon as possible.</p><button className="gold-button" onClick={close}>DONE</button></div> : <><p className="eyebrow dark">GUEST DETAILS</p><h2>Complete your <i>booking.</i></h2><p className="booking-confirmation">Selected room: <strong>{chosen}</strong></p><form onSubmit={event => { event.preventDefault(); setSent(true); }}><label>Full Name<input required placeholder="Enter your name"/></label><label>Phone Number<input required type="tel" placeholder="Enter your phone number"/></label><label>Email Address<input type="email" placeholder="Enter your email"/></label><label>Message<textarea placeholder="Any special request"/></label><button className="gold-button">SUBMIT BOOKING <span>-&gt;</span></button></form></>}</div></div>}
    {lightbox !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image" onClick={() => setLightbox(null)}><button aria-label="Close fullscreen image" onClick={() => setLightbox(null)}>×</button><img src={gallery[lightbox]} alt={`KPS INN gallery ${lightbox + 1}`} onClick={event => event.stopPropagation()}/><p>Click outside the image to close</p></div>}
  </>;
}

function RoomRoute(){ const { slug } = useParams(); return <RoomDetailsPage slug={slug}/>; }
function RouterApp(){ return <><Routes><Route path="/" element={<App/>}/><Route path="/rooms" element={<App/>}/><Route path="/room/:slug" element={<RoomRoute/>}/></Routes><BookingPopup/></>; }
function SiteEntry(){ const [loading, setLoading] = useState(true); return <>{loading ? <SplashScreen onComplete={() => setLoading(false)}/> : <RouterApp/>}</>; }
createRoot(document.getElementById('root')).render(<BrowserRouter basename={import.meta.env.BASE_URL}><BookingProvider><SiteEntry/></BookingProvider></BrowserRouter>);
