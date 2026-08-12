import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './hero-slider.css';
import hotelBuilding from '../assets/gallery/hotel-building.jpg';
import premiumSuite from '../assets/gallery/premium-suite.jpg';
import poolLayout from '../assets/gallery/pool-layout.jpg';
import restaurantDining from '../assets/gallery/restaurant-dining.jpg';
import heroLuxury from '../assets/gallery/hero-luxury.png';

const FALLBACK_SLIDES = [
  { image: hotelBuilding, eyebrow: 'KPS INN · KARUR', title: 'Experience Timeless Luxury', copy: 'Where elegance meets comfort. Discover a stay crafted with world-class hospitality and unforgettable experiences.', cta: 'Book Your Stay', ctaTarget: 'book', motion: 'zoom' },
  { image: premiumSuite, eyebrow: 'REST, REIMAGINED', title: 'Luxury Rooms & Suites', copy: 'Wake up to breathtaking interiors, premium comfort, and exceptional attention to every detail.', cta: 'View Rooms', ctaTarget: 'book', motion: 'pan' },
  { image: poolLayout, eyebrow: 'A MOMENT FOR YOU', title: 'Relax. Refresh. Rejuvenate.', copy: 'Escape into serenity with our infinity pool, spa, wellness center, and premium leisure facilities.', cta: 'Explore Amenities', ctaTarget: '/#amenities', motion: 'parallax' },
  { image: restaurantDining, eyebrow: 'DINING AT KPS INN', title: 'An Unforgettable Culinary Experience', copy: 'Taste handcrafted cuisine prepared by our expert chefs in an elegant dining atmosphere.', cta: 'Reserve a Table', ctaTarget: '/#contact', motion: 'zoom' },
  { image: heroLuxury, eyebrow: 'YOUR NEXT ESCAPE', title: 'Create Memories That Last Forever', copy: "Whether it's a vacation, honeymoon, family getaway, or business trip, experience hospitality beyond expectations.", cta: 'Book Now', ctaTarget: 'book', secondary: 'Contact Us', secondaryTo: '/#contact', motion: 'glow' },
];

const normalizeSlide = (slide, index) => ({
  id: slide.id || `slide-${index}`,
  image: slide.image || FALLBACK_SLIDES[index % FALLBACK_SLIDES.length].image,
  eyebrow: slide.eyebrow || '',
  title: slide.title || '',
  copy: slide.copy || '',
  cta: slide.cta || 'Book Now',
  ctaTarget: slide.ctaTarget || 'book',
  secondary: slide.secondary || '',
  secondaryTo: slide.secondaryTo || '',
  motion: slide.motion || 'zoom',
});

function SliderButton({ slide, onBook }) {
  if (slide.ctaTarget === 'book') return <button className="luxury-primary-cta" onClick={onBook}>{slide.cta}<span>→</span></button>;
  return <Link className="luxury-primary-cta" to={slide.ctaTarget}>{slide.cta}<span>→</span></Link>;
}

export default function HeroSlider({ onBook }) {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);

  useEffect(() => {
    let activeFlag = true;
    (async () => {
      try {
        const res = await fetch('/api/hero-slides');
        if (!res.ok) throw new Error('hero API unavailable');
        const data = await res.json();
        if (activeFlag && Array.isArray(data) && data.length > 0) {
          const ordered = [...data]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map(normalizeSlide);
          setSlides(ordered);
          setActive(0);
        }
      } catch {
        // keep bundled fallback slides when the backend is not available
      }
    })();
    return () => { activeFlag = false; };
  }, []);

  const changeSlide = direction => setActive(current => (current + direction + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => changeSlide(1), 5000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const onTouchStart = event => { touchStart.current = event.touches[0].clientX; };
  const onTouchEnd = event => {
    if (touchStart.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(distance) > 45) changeSlide(distance > 0 ? -1 : 1);
    touchStart.current = null;
  };

  return <section className="luxury-hero-slider" aria-label="KPS INN highlights" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="luxury-hero-slides">{slides.map((slide, index) => <article className={`luxury-hero-slide ${slide.motion} ${index === active ? 'is-active' : ''}`} aria-hidden={index !== active} key={slide.id}>
      <img src={slide.image} alt="" fetchPriority={index === 0 ? 'high' : 'low'} loading={index === 0 ? 'eager' : 'lazy'} /><div className="luxury-hero-overlay" />
      <div className="luxury-hero-copy"><p className="luxury-hero-kicker">{slide.eyebrow}</p><h1>{slide.title}</h1><p className="luxury-hero-description">{slide.copy}</p><div className="luxury-hero-actions"><SliderButton slide={slide} onBook={onBook} />{slide.secondary && slide.secondaryTo && <Link className="luxury-secondary-cta" to={slide.secondaryTo}>{slide.secondary}</Link>}</div></div>
    </article>)}</div>
    <div className="luxury-hero-controls"><button className="luxury-slider-arrow" aria-label="Previous slide" onClick={() => changeSlide(-1)}>←</button><div className="luxury-slider-pagination" aria-label="Select slide">{slides.map((slide, index) => <button className={index === active ? 'is-active' : ''} aria-label={`Go to slide ${index + 1}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} key={slide.id}><span /></button>)}</div><button className="luxury-slider-arrow" aria-label="Next slide" onClick={() => changeSlide(1)}>→</button></div>
    <p className="luxury-hero-count"><b>0{active + 1}</b><span>/ 0{slides.length}</span></p>
  </section>;
}
