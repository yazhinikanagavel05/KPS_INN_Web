import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './hero-slider.css';
import hotelBuilding from '../assets/gallery/hotel-building.jpg';
import premiumSuite from '../assets/gallery/premium-suite.jpg';
import poolLayout from '../assets/gallery/pool-layout.jpg';
import restaurantDining from '../assets/gallery/restaurant-dining.jpg';
import heroLuxury from '../assets/gallery/hero-luxury.png';

const slides = [
  { image: hotelBuilding, eyebrow: 'KPS INN · KARUR', title: 'Experience Timeless Luxury', copy: 'Where elegance meets comfort. Discover a stay crafted with world-class hospitality and unforgettable experiences.', primary: 'Book Your Stay', primaryAction: 'book', secondary: 'Explore Rooms', secondaryTo: '/rooms', motion: 'zoom' },
  { image: premiumSuite, eyebrow: 'REST, REIMAGINED', title: 'Luxury Rooms & Suites', copy: 'Wake up to breathtaking interiors, premium comfort, and exceptional attention to every detail.', primary: 'View Rooms', primaryTo: '/rooms', secondary: 'Check Availability', secondaryTo: '/rooms', motion: 'pan' },
  { image: poolLayout, eyebrow: 'A MOMENT FOR YOU', title: 'Relax. Refresh. Rejuvenate.', copy: 'Escape into serenity with our infinity pool, spa, wellness center, and premium leisure facilities.', primary: 'Explore Amenities', primaryTo: '/#amenities', motion: 'parallax' },
  { image: restaurantDining, eyebrow: 'DINING AT KPS INN', title: 'An Unforgettable Culinary Experience', copy: 'Taste handcrafted cuisine prepared by our expert chefs in an elegant dining atmosphere.', primary: 'Reserve a Table', primaryTo: '/#contact', motion: 'zoom' },
  { image: heroLuxury, eyebrow: 'YOUR NEXT ESCAPE', title: 'Create Memories That Last Forever', copy: "Whether it's a vacation, honeymoon, family getaway, or business trip, experience hospitality beyond expectations.", primary: 'Book Now', primaryAction: 'book', secondary: 'Contact Us', secondaryTo: '/#contact', motion: 'glow' },
];

function SliderButton({ slide, onBook }) {
  if (slide.primaryAction === 'book') return <button className="luxury-primary-cta" onClick={onBook}>{slide.primary}<span>→</span></button>;
  return <Link className="luxury-primary-cta" to={slide.primaryTo}>{slide.primary}<span>→</span></Link>;
}

export default function HeroSlider({ onBook }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const changeSlide = direction => setActive(current => (current + direction + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => changeSlide(1), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const onTouchStart = event => { touchStart.current = event.touches[0].clientX; };
  const onTouchEnd = event => {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(distance) > 45) changeSlide(distance > 0 ? -1 : 1);
    touchStart.current = null;
  };

  return <section className="luxury-hero-slider" aria-label="KPS INN highlights" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="luxury-hero-slides">{slides.map((slide, index) => <article className={`luxury-hero-slide ${slide.motion} ${index === active ? 'is-active' : ''}`} aria-hidden={index !== active} key={slide.title}>
      <img src={slide.image} alt="" fetchPriority={index === 0 ? 'high' : 'low'} loading={index === 0 ? 'eager' : 'lazy'}/><div className="luxury-hero-overlay"/>
      <div className="luxury-hero-copy"><p className="luxury-hero-kicker">{slide.eyebrow}</p><h1>{slide.title}</h1><p className="luxury-hero-description">{slide.copy}</p><div className="luxury-hero-actions"><SliderButton slide={slide} onBook={onBook}/>{slide.secondary && <Link className="luxury-secondary-cta" to={slide.secondaryTo}>{slide.secondary}</Link>}</div></div>
    </article>)}</div>
    <div className="luxury-hero-controls"><button className="luxury-slider-arrow" aria-label="Previous slide" onClick={() => changeSlide(-1)}>←</button><div className="luxury-slider-pagination" aria-label="Select slide">{slides.map((slide, index) => <button className={index === active ? 'is-active' : ''} aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} key={slide.title}><span/></button>)}</div><button className="luxury-slider-arrow" aria-label="Next slide" onClick={() => changeSlide(1)}>→</button></div>
    <p className="luxury-hero-count"><b>0{active + 1}</b><span>/ 0{slides.length}</span></p>
  </section>;
}
