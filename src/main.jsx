import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';
import './styles.css';
import './booking.css';
import './buttons.css';
import './components/room-card-alignment.css';
import { RoomDetailsPage } from './components/RoomsExperience';
import { BookingPopup, BookingProvider } from './components/BookingSystem';
import { useGoToBooking } from './lib/bookingNav';
import { performPendingContactScroll } from './lib/contactNav';
import SiteHeader from './components/SiteHeader';
import HeroSlider from './components/HeroSlider';
import SplashScreen from './components/SplashScreen';
import AboutPage from './components/AboutPage';
import AvailabilitySearch from './components/AvailabilitySearch';
import DashboardPage from './components/DashboardPage';
import {
  bookingPopupCss,
  experiencePolishCss,
  galleryEnhancementCss,
  galleryExperienceCss,
  sectionRhythmCss,
} from './lib/siteStyles';

import logo from './assets/logo/kps-inn-logo.png';
import hotelLobby from './assets/gallery/hotel-lobby.jpg';
import hotelBuilding from './assets/gallery/hotel-building.jpg';
import poolLayout from './assets/gallery/pool-layout.jpg';
import hotelRoom from './assets/gallery/hotel-room.jpg';
import bedroomInterior from './assets/gallery/bedroom-interior.jpg';
import restaurantDining from './assets/gallery/restaurant-dining.jpg';
import comfortRoom from './assets/gallery/comfort-room.jpg';
import premiumSuite from './assets/gallery/premium-suite.jpg';
import executiveLounge from './assets/gallery/executive-lounge.jpg';
import luxuryBathroom from './assets/gallery/luxury-bathroom.jpg';

const Icon = ({ children }) => <span className="icon" aria-hidden="true">{children}</span>;

const fallbackGallery = [
  hotelRoom,
  bedroomInterior,
  hotelBuilding,
  restaurantDining,
  hotelLobby,
  comfortRoom,
  premiumSuite,
  executiveLounge,
  luxuryBathroom,
  poolLayout,
];

function useGalleryImages() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) throw new Error('gallery API unavailable');
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setImages(data.map((item, index) => ({
            id: item.id || `api-${index}`,
            src: `/uploads/gallery/${item.filename}`,
            title: item.title || '',
          })));
          return;
        }
        throw new Error('empty gallery');
      } catch {
        if (active) {
          setImages(fallbackGallery.map((src, index) => ({ id: `local-${index}`, src, title: '' })));
        }
      }
    })();

    return () => { active = false; };
  }, []);

  return images;
}

function GalleryLightbox({ active, onClose, onChange, images }) {
  if (active === null || images.length === 0) return null;
  const go = direction => onChange((active + direction + images.length) % images.length);
  const image = images[active];

  return (
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Gallery preview" onClick={onClose}>
      <button className="gallery-lightbox-close" aria-label="Close preview" onClick={onClose}>×</button>
      <p className="gallery-lightbox-counter">{String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</p>
      <button className="gallery-lightbox-nav prev" aria-label="Previous image" onClick={event => { event.stopPropagation(); go(-1); }}>&larr;</button>
      <img className="gallery-lightbox-main" src={image.src} alt={`KPS INN gallery ${active + 1}`} onClick={event => event.stopPropagation()} />
      <button className="gallery-lightbox-nav next" aria-label="Next image" onClick={event => { event.stopPropagation(); go(1); }}>&rarr;</button>
      <div className="gallery-lightbox-thumbs" onClick={event => event.stopPropagation()}>
        {images.map((thumb, index) => (
          <button className={index === active ? 'active' : ''} aria-label={`Preview image ${index + 1}`} onClick={() => onChange(index)} key={thumb.id}>
            <img src={thumb.src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const goToBooking = useGoToBooking();
  const images = useGalleryImages();
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { performPendingContactScroll(); }, []);

  return (
    <>
      <SiteHeader />
      <main id="top">
        <HeroSlider onBook={goToBooking} />
        <style>{galleryExperienceCss}{galleryEnhancementCss}{experiencePolishCss}{sectionRhythmCss}</style>
        <AvailabilitySearch />

        <section className="section about-luxury" id="about">
          <div className="about-copy">
            <p className="about-kicker">KPS INN</p>
            <p className="eyebrow dark">WHY GUESTS CHOOSE KPS INN</p>
            <h2>More than a stay.<br /><i>A place you'll want to return to.</i></h2>
            <p>From the moment you arrive, every detail is thoughtfully designed to make you feel welcomed, relaxed, and completely at home. Whether you're visiting for business or leisure, KPS INN offers warm hospitality, elegant comfort, and memorable experiences that keep guests coming back.</p>
            <div className="about-features">
              <div className="about-feature"><b>Thoughtful Comfort</b><span>Elegant rooms, premium amenities, and peaceful interiors designed to help you relax and enjoy every moment of your stay.</span></div>
              <div className="about-feature"><b>Hospitality That Cares</b><span>Our dedicated team is always ready to provide attentive service, ensuring every guest feels valued, comfortable, and well cared for.</span></div>
            </div>
            <Link className="text-link" to="/" onClick={event => { event.preventDefault(); goToBooking(); }}>EXPLORE OUR ROOMS <span>-&gt;</span></Link>
          </div>
          <div className="about-visual">
            <img src={hotelLobby} alt="KPS INN reception and guest space" />
            <div className="about-badge">Comfort.<br />Care.<br />Memories.<small>Every stay is thoughtfully crafted to leave you with moments you'll always remember.</small></div>
          </div>
        </section>

        <section className="image-break">
          <img src={hotelBuilding} alt="KPS INN guest space" />
          <div><p>SIMPLE SERVICE, DONE WELL</p><h2>Clean rooms.<br /><i>Clear communication.</i></h2></div>
        </section>

        <section className="amenities">
          <div className="amenity-photo" style={{ backgroundImage: `url(${poolLayout})` }}></div>
          <div className="amenity-copy">
            <p className="eyebrow">GUEST COMFORTS</p>
            <h2>Useful amenities,<br /><i>thoughtfully provided.</i></h2>
            <div className="amenity-list">
              <p><Icon>*</Icon> Free Wi-Fi</p>
              <p><Icon>*</Icon> Parking Facility</p>
              <p><Icon>*</Icon> Guest Support</p>
              <p><Icon>*</Icon> Clean Rooms</p>
              <p><Icon>*</Icon> 24 Hour Reception</p>
            </div>
            <a className="outline-button" href="#contact">CONTACT OUR TEAM <span>-&gt;</span></a>
          </div>
        </section>

        <section className="gallery section" id="gallery">
          <div className="section-title">
            <div>
              <p className="eyebrow dark">A GLIMPSE INSIDE</p>
              <h2>Explore <i>KPS INN.</i></h2>
            </div>
            <p>A curated preview of the rooms and spaces waiting for you. Discover the complete collection in our gallery.</p>
          </div>
          <div className="gallery-grid-luxury">
            {images.length > 0
              ? images.map((image, index) => <img loading="lazy" src={image.src} onClick={() => setLightbox(index)} alt={`KPS INN gallery ${index + 1}`} key={image.id} />)
              : <div>Loading gallery...</div>}
          </div>
          <div className="gallery-preview-panel">
            <p>Every space has its own story. Step inside the complete KPS INN collection and find the details that will make your stay feel special.</p>
            <Link className="gallery-preview-link" to="/gallery">VIEW ALL PHOTOS &rarr;</Link>
          </div>
        </section>

        <section className="quote">
          <p className="eyebrow dark">KPS INN</p>
          <blockquote>"Our team focuses on simple service done well: clean rooms, clear communication, and a stay that feels relaxed."</blockquote>
          <p className="guest">KARUR, TAMIL NADU</p>
        </section>

        <section className="contact-cta section" id="contact">
          <p className="eyebrow dark">RESERVE YOUR ROOM</p>
          <h2>Plan a comfortable<br /><i>stay.</i></h2>
          <p className="contact-summary">Check-in: 12:00 PM &nbsp; / &nbsp; Check-out: 11:00 AM<br />+91 99449 32516</p>
          <button className="gold-button" onClick={goToBooking}>REQUEST BOOKING <span>-&gt;</span></button>
        </section>
      </main>

      <footer id="footer">
        <div className="footer-brand">
          <img className="crest" src={logo} alt="KPS INN logo" /><b>KPS INN</b><i>Comfortable rooms and friendly service</i>
        </div>
        <div>
          <p>CONTACT</p>
          <a href="tel:+919944932516">+91 99449 32516</a>
          <a href="https://www.google.com/maps/search/?api=1&query=X375%2B6R9%20Karur%2C%20Tamil%20Nadu" target="_blank" rel="noreferrer">View Location ↗</a>
        </div>
        <div>
          <p>VISIT</p>
          <address>#5/285/1, Ashok Nagar,<br />Kovai Road, Karur-639002.</address>
        </div>
        <div>
          <p>RECEPTION</p>
          <span>Open 24 hours for guest assistance.</span>
          <p>GST No: 33AHUPA9066B4ZB</p>
        </div>
        <small>© 2026 KPS INN. ALL RIGHTS RESERVED.</small>
      </footer>

      <a href="tel:+919944932516" className="whatsapp" aria-label="Call KPS INN">☎</a>
      <GalleryLightbox active={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} images={images} />
    </>
  );
}

function GalleryPage() {
  const [active, setActive] = useState(null);
  const images = useGalleryImages();

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, []);

  return (
    <div>
      <style>{galleryExperienceCss}{galleryEnhancementCss}{experiencePolishCss}{sectionRhythmCss}</style>
      <SiteHeader />
      <main className="gallery-page-main">
        <div className="gallery-page-title">
          <p className="eyebrow dark">KPS INN IN PICTURES</p>
          <h1>Moments of <i>comfort.</i></h1>
          <p>Take a closer look at the rooms, guest spaces, and details that shape a relaxed stay at KPS INN.</p>
        </div>
        <div className="gallery-page-grid">
          {images.length > 0
            ? images.map((image, index) => (
                <button onClick={() => setActive(index)} key={image.id}>
                  <img loading="lazy" src={image.src} alt={`KPS INN gallery ${index + 1}`} />
                </button>
              ))
            : <div>Loading gallery...</div>}
        </div>
      </main>
      <GalleryLightbox active={active} onClose={() => setActive(null)} onChange={setActive} images={images} />
    </div>
  );
}

function RoomRoute() {
  const { slug } = useParams();
  return <RoomDetailsPage slug={slug} />;
}

function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/rooms/:slug" element={<RoomRoute />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

function SiteEntry() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading ? <SplashScreen onComplete={() => setLoading(false)} /> : <RouterApp />}
      <style>{bookingPopupCss}</style>
      <BookingPopup />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <BookingProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SiteEntry />
    </BrowserRouter>
  </BookingProvider>
);
