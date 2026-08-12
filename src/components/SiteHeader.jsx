import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoToBooking } from '../lib/bookingNav';
import { useGoToContact } from '../lib/contactNav';
import logo from '../assets/logo/kps-inn-logo.png';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Rooms', booking: true },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Contact', contact: true },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const goToBooking = useGoToBooking();
  const goToContact = useGoToContact();
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <Link className="brand" to="/" aria-label="KPS INN home"><img className="hotel-logo" src={logo} alt="KPS INN logo"/><span><b>KPS INN</b><i>Comfortable rooms and friendly service</i></span></Link>
      <button className="hamburger" onClick={() => setMenu(open => !open)} aria-label="Toggle menu">Menu</button>
      <nav className={menu ? 'open' : ''}>
        {navItems.map(item => {
          if (item.booking) {
            return <Link key={item.label} to="/" onClick={event => { event.preventDefault(); setMenu(false); goToBooking(); }}>{item.label}</Link>;
          }
          if (item.contact) {
            return <Link key={item.label} to="/" onClick={event => { event.preventDefault(); setMenu(false); goToContact(); }}>{item.label}</Link>;
          }
          return <Link key={item.label} to={item.href} onClick={() => setMenu(false)}>{item.label}</Link>;
        })}
        <button onClick={() => { setMenu(false); goToBooking(); }}>BOOK NOW <span>-&gt;</span></button>
      </nav>
    </header>
  );
}