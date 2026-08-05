import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo/kps-inn-logo.png';
import reception from '../assets/gallery/hero-luxury.png';
import hotelLobby from '../assets/gallery/hotel-lobby.jpg';
import hotelBuilding from '../assets/gallery/hotel-building.jpg';
import restaurantDining from '../assets/gallery/restaurant-dining.jpg';
import comfortRoom from '../assets/gallery/comfort-room.jpg';

const highlights = [
  {
    title: 'Thoughtful comfort',
    text: 'Soft bedding, calm interiors, and spaces that help guests settle in with ease.'
  },
  {
    title: 'Friendly support',
    text: 'A dedicated team is always ready to assist with stays, bookings, and local guidance.'
  },
  {
    title: 'Clean and cared for',
    text: 'Every room is prepared with attention to detail so your stay feels fresh and relaxed.'
  }
];

function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="about-page-shell">
      <header className="scrolled">
        <Link className="brand" to="/" aria-label="KPS INN home">
          <img className="hotel-logo" src={logo} alt="KPS INN logo" />
          <span>
            <b>KPS INN</b>
            <i>Comfortable rooms and friendly service</i>
          </span>
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/gallery">Gallery</Link>
          <a href="/#contact">Contact</a>
        </nav>
      </header>

      <main className="about-page-main">
        <section className="about-page-hero">
          <div className="about-page-hero-copy">
            <p className="eyebrow dark">ABOUT KPS INN</p>
            <h1>Stay that feels calm, personal, and effortless.</h1>
            <p>
              KPS INN is a welcoming stay in Karur for guests who want dependable hospitality,
              neatly kept spaces, and a peaceful base for work or travel.
            </p>
            <div className="about-page-actions">
              <Link className="gold-button" to="/rooms">EXPLORE ROOMS <span>-&gt;</span></Link>
              <a className="outline-button" href="tel:+919944932516">CALL US</a>
            </div>
          </div>

          <div className="about-page-hero-card">
            <img src={hotelLobby} alt="KPS INN lobby and welcoming interior" />
            <div className="about-page-hero-badge">Comfort • Care • Cleanliness</div>
          </div>
        </section>

        <section className="about-page-highlights">
          {highlights.map((item) => (
            <article key={item.title} className="about-page-highlight-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="about-page-story">
          <div className="about-page-story-copy">
            <p className="eyebrow dark">OUR STORY</p>
            <h2>More than a place to sleep — a stay designed around ease.</h2>
            <p>
              We believe comfort should feel simple. From a smooth check-in to a restful room at the end of the day,
              every detail is shaped to make guests feel looked after from the first hello to the last goodbye.
            </p>
          </div>

          <div className="about-page-story-grid">
            <div className="about-page-story-card">
              <span>01</span>
              <h3>Warm welcome</h3>
              <p>Guests are greeted with straightforward service and a calm, helpful atmosphere.</p>
            </div>
            <div className="about-page-story-card">
              <span>02</span>
              <h3>Practical comfort</h3>
              <p>Rooms and shared spaces are arranged to feel comfortable for short stays and longer visits alike.</p>
            </div>
            <div className="about-page-story-card">
              <span>03</span>
              <h3>Flexible stay</h3>
              <p>Whether you are traveling for business or family time, we aim to support your pace.</p>
            </div>
          </div>
        </section>

        <section className="about-page-gallery">
          <img src={reception} alt="KPS INN reception and welcome area" />
          <img src={hotelBuilding} alt="The exterior of KPS INN" />
          <img src={restaurantDining} alt="Dining and guest gathering space" />
          <img src={comfortRoom} alt="Comfortable room at KPS INN" />
        </section>

        <section className="about-page-cta">
          <div>
            <p className="eyebrow dark">READY TO EXPERIENCE IT?</p>
            <h2>Reserve a room shaped around your pace.</h2>
            <p>From a smooth arrival to a restful evening, every part of your stay is designed to feel easy and thoughtful.</p>
          </div>
          <Link className="gold-button" to="/rooms">BOOK YOUR STAY <span>-&gt;</span></Link>
        </section>
      </main>

      <footer className="about-page-footer">
        <div className="footer-brand">
          <img className="crest" src={logo} alt="KPS INN logo" />
          <b>KPS INN</b>
          <i>Comfortable rooms and friendly service</i>
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
        <small>© 2026 KPS INN. ALL RIGHTS RESERVED.</small>
      </footer>
    </div>
  );
}

export default AboutPage;
