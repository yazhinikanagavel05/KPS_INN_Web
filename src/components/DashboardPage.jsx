import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import { processImage } from '../lib/imageUpload';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled'];
const MOTION_OPTIONS = ['zoom', 'pan', 'parallax', 'glow'];
const CTA_TARGETS = [
  { value: 'book', label: 'Open booking form' },
  { value: '/#amenities', label: 'Link to amenities' },
  { value: '/#contact', label: 'Link to contact' },
  { value: '/gallery', label: 'Link to gallery' },
  { value: '/about', label: 'Link to about' },
];

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  let json = null;
  try { json = await res.json(); } catch { /* not json */ }
  if (!res.ok) throw new Error((json && json.error) || 'Request failed');
  return json;
}

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
const bookingTime = b => new Date(b.bookingDate || b.createdAt || 0).getTime();
const sortBookingsNewest = list => [...list].sort((a, b) => bookingTime(b) - bookingTime(a));

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const dashboardCss = `
  .dash-shell{min-height:100vh;background:#f4f0e8}
  .dash-layout{display:grid;grid-template-columns:230px 1fr;max-width:1240px;margin:0 auto;gap:32px;padding:120px 4vw 80px}
  .dash-side{display:flex;flex-direction:column;gap:6px;align-self:start;background:#17140f;border-radius:14px;padding:20px 14px;position:sticky;top:110px}
  .dash-side h3{color:#b7935a;font:700 10px 'DM Sans',sans-serif;letter-spacing:2px;margin:4px 10px 10px}
  .dash-side button{border:0;background:transparent;color:#e9dfcd;font:12px 'DM Sans',sans-serif;letter-spacing:.6px;text-align:left;padding:11px 14px;border-radius:8px;cursor:pointer}
  .dash-side button:hover{background:rgba(255,255,255,.07)}
  .dash-side button.active{background:#9d7a45;color:#fff8eb;font-weight:600}
  .dash-view-site{margin-top:14px;width:100%}
  .dash-main{min-width:0}
  .dash-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:24px}
  .dash-head h1{font:500 44px/1.05 'Playfair Display',serif;margin:0}
  .dash-head p{color:#6b6155;font-size:13px;margin:10px 0 0}
  .dash-notice,.dash-busy{font-size:12px;padding:11px 15px;border-radius:9px;margin:0 0 16px}
  .dash-notice{background:#e0efdd;color:#2e6b34}
  .dash-busy{background:#f6ead2;color:#8a5a1e}
  .dash-loading{padding:70px 0;text-align:center;color:#8a7d6c;font-size:13px}
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:26px}
  .stat-card{background:#fffdf8;border:1px solid #e6dcc9;border-radius:12px;padding:20px;box-shadow:0 10px 28px rgba(40,28,15,.07)}
  .stat-card p{margin:0 0 8px;font-size:10px;letter-spacing:1.2px;color:#9a7440;text-transform:uppercase}
  .stat-card b{font:600 32px 'Playfair Display',serif;color:#241c13}
  .stat-card .status-pill{margin-left:8px}
  .dash-card{background:#fffdf8;border:1px solid #e6dcc9;border-radius:12px;box-shadow:0 10px 28px rgba(40,28,15,.08);overflow:hidden;margin-bottom:24px}
  .dash-card h2{font:500 21px 'Playfair Display',serif;margin:0;padding:20px 24px;border-bottom:1px solid #efe6d5}
  .dash-card h2 small{font:12px 'DM Sans',sans-serif;color:#8a7d6c;margin-left:8px}
  .dash-card-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;border-bottom:1px solid #efe6d5}
  .dash-card-head h2{padding:0;border:0}
  .dash-empty{padding:34px 24px;color:#8a7d6c;font-size:13px;line-height:1.7}
  .dash-view-all{margin:20px 24px 24px}
  .booking-table{width:100%;border-collapse:collapse;font-size:12px}
  .booking-table th,.booking-table td{padding:13px 24px;text-align:left;border-bottom:1px solid #f0e8d9;vertical-align:top}
  .booking-table th{color:#9a7440;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;background:#faf6ed}
  .booking-table tr:last-child td{border-bottom:0}
  .booking-table tbody tr{cursor:pointer;transition:background .15s}
  .booking-table tbody tr:hover{background:#faf5ea}
  .booking-table b{display:block;color:#241c13}
  .booking-table small{color:#8d806f}
  .status-pill{display:inline-block;padding:4px 10px;border-radius:99px;font-size:10px;font-weight:600;letter-spacing:.5px}
  .status-pill.Pending{background:#f6ead2;color:#8a5a1e}
  .status-pill.Confirmed{background:#e0efdd;color:#2e6b34}
  .status-pill.Cancelled{background:#f2ddd9;color:#93382a}
  .status-select{font:12px 'DM Sans',sans-serif;padding:7px 10px;border:1px solid #d8c9ae;border-radius:7px;background:#fff;color:#2b241c;cursor:pointer}
  .dash-modal-backdrop{position:fixed;inset:0;z-index:120;background:rgba(20,14,10,.6);display:flex;align-items:center;justify-content:center;padding:24px}
  .dash-modal{background:#fffdf8;border:1px solid #e6dcc9;border-radius:14px;box-shadow:0 24px 60px rgba(20,14,10,.35);padding:30px;max-width:520px;width:100%;max-height:88vh;overflow:auto;position:relative}
  .dash-modal h3{font:500 26px 'Playfair Display',serif;margin:0 0 18px}
  .dash-modal-close{position:absolute;top:14px;right:16px;border:0;background:transparent;font-size:26px;color:#8a7d6c;cursor:pointer}
  .dash-details{display:grid;grid-template-columns:1fr 1fr;gap:12px 22px;margin:0 0 20px}
  .dash-details div{min-width:0}
  .dash-details dt{font-size:10px;letter-spacing:1px;color:#9a7440;text-transform:uppercase;margin-bottom:4px}
  .dash-details dd{margin:0;font-size:13px;color:#241c13;word-break:break-word}
  .dash-details div:last-child{grid-column:1/-1}
  .dash-status-label{display:flex;align-items:center;gap:12px;font-size:11px;letter-spacing:1px;color:#6b6155;margin:0 0 20px}
  .gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:22px 24px}
  .gallery-card{background:#fff;border:1px solid #e6dcc9;border-radius:10px;overflow:hidden}
  .gallery-card img{width:100%;height:150px;object-fit:cover;display:block}
  .gallery-card-body{padding:12px}
  .gallery-card-body p{margin:0 0 10px;font-size:11px;color:#4a4036;word-break:break-word;min-height:14px}
  .gallery-card-actions{display:flex;gap:8px}
  .gallery-card-actions button{flex:1;padding:8px 6px;font-size:10px}
  .outline-button.danger{border-color:#c9775f;color:#93382a}
  .outline-button.danger:hover{background:#f2ddd9;color:#93382a}
  .hero-list{padding:18px 24px 24px}
  .hero-card{display:grid;grid-template-columns:230px 1fr;gap:20px;background:#fff;border:1px solid #e6dcc9;border-radius:12px;padding:18px;margin-bottom:16px}
  .hero-card-image img{width:100%;height:150px;object-fit:cover;border-radius:8px;display:block}
  .hero-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .hero-card-top b{font:600 11px 'DM Sans',sans-serif;letter-spacing:1.5px;color:#9a7440}
  .hero-order{display:flex;gap:6px}
  .hero-order button{border:1px solid #d8c9ae;background:#fff;width:30px;height:30px;border-radius:7px;cursor:pointer;color:#4a4036}
  .hero-order button:disabled{opacity:.35;cursor:default}
  .hero-card-body label{display:block;font-size:10px;letter-spacing:1px;color:#6b6155;text-transform:uppercase;margin:0 0 10px}
  .hero-card-body input,.hero-card-body textarea,.hero-card-body select{width:100%;margin-top:5px;padding:9px 11px;border:1px solid #d8c9ae;border-radius:7px;font:13px 'DM Sans',sans-serif;color:#2b241c;background:#fff;box-sizing:border-box}
  .hero-card-body textarea{resize:vertical}
  .hero-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .hero-card-actions{display:flex;gap:10px;margin-top:14px}
  .hero-card-actions button{flex:1}
  @media(max-width:1000px){.stat-grid{grid-template-columns:repeat(2,1fr)}.gallery-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:860px){.dash-layout{grid-template-columns:1fr;padding-top:110px}.dash-side{position:static}.hero-card{grid-template-columns:1fr}.hero-row{grid-template-columns:1fr}}
  @media(max-width:560px){.dash-head{flex-direction:column;align-items:flex-start}.stat-grid{grid-template-columns:1fr}.gallery-grid{grid-template-columns:1fr}.dash-details{grid-template-columns:1fr}}
`;

const TABS = [
  ['overview', 'Overview'],
  ['bookings', 'Bookings'],
  ['gallery', 'Gallery'],
  ['hero', 'Hero Slider'],
];

export default function DashboardPage() {
  const [tab, setTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [slides, setSlides] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingUpload, setPendingUpload] = useState(null);
  const fileInputRef = useRef(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bookingsData, galleryData, slidesData] = await Promise.all([
        fetchJson('/api/bookings').catch(() => []),
        fetchJson('/api/gallery').catch(() => []),
        fetchJson('/api/hero-slides').catch(() => []),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setGallery(Array.isArray(galleryData) ? galleryData : []);
      setSlides(Array.isArray(slidesData) ? slidesData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const refresh = async () => {
    setNotice('');
    await loadAll();
  };

  const startUpload = (type, section, id) => {
    setPendingUpload({ type, section, id });
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleFile = async event => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file || !pendingUpload) return;
    const { type, section, id } = pendingUpload;
    setPendingUpload(null);
    setNotice('');
    setBusy(type === 'gallery-add' || type === 'hero-add' ? 'Uploading new image…' : 'Replacing image…');
    try {
      const processed = await processImage(file);
      if (!processed.ok) {
        setNotice(`Error: ${processed.error}`);
        return;
      }
      const headers = { 'Content-Type': 'application/json' };
      if (type === 'gallery-add') {
        const created = await fetchJson('/api/gallery', {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: file.name.replace(/\.[^.]+$/, '').slice(0, 60), data: processed.data }),
        });
        setGallery(g => [...g, created]);
        setNotice('Gallery image added. It now appears on the public site.');
      } else if (type === 'gallery-replace') {
        const updated = await fetchJson(`/api/gallery/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ data: processed.data }),
        });
        setGallery(g => g.map(item => (item.id === updated.id ? updated : item)));
        setNotice('Gallery image replaced.');
      } else if (type === 'hero-add') {
        const created = await fetchJson('/api/hero-slides', {
          method: 'POST',
          headers,
          body: JSON.stringify({ data: processed.data, title: 'New Slide', eyebrow: 'KPS INN', copy: '', cta: 'Book Now', ctaTarget: 'book', motion: 'zoom' }),
        });
        setSlides(s => [...s, created].sort(byOrder));
        setNotice('Hero slide added. It now appears on the homepage.');
      } else if (type === 'hero-replace') {
        const updated = await fetchJson(`/api/hero-slides/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ data: processed.data }),
        });
        setSlides(s => s.map(item => (item.id === updated.id ? updated : item)).sort(byOrder));
        setNotice('Hero image replaced.');
      }
    } catch (error) {
      setNotice(`Upload failed: ${error.message}`);
    } finally {
      setBusy('');
    }
  };

  const deleteGalleryImage = async id => {
    if (!window.confirm('Are you sure you want to remove this image?')) return;
    setBusy('Removing image…');
    try {
      await fetchJson(`/api/gallery/${id}`, { method: 'DELETE' });
      setGallery(g => g.filter(item => item.id !== id));
      setNotice('Gallery image deleted. It has been removed from the public site.');
    } catch (error) {
      setNotice(`Delete failed: ${error.message}`);
    } finally {
      setBusy('');
    }
  };

  const deleteSlide = async id => {
    if (!window.confirm('Are you sure you want to remove this slide?')) return;
    setBusy('Removing slide…');
    try {
      await fetchJson(`/api/hero-slides/${id}`, { method: 'DELETE' });
      setSlides(s => s.filter(item => item.id !== id).sort(byOrder));
      setNotice('Hero slide deleted.');
    } catch (error) {
      setNotice(`Delete failed: ${error.message}`);
    } finally {
      setBusy('');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const updated = await fetchJson(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setBookings(b => b.map(item => (item.id === updated.id ? updated : item)));
      if (selectedBooking && selectedBooking.id === id) setSelectedBooking(updated);
      setNotice(`Booking ${id} marked as ${status}.`);
    } catch (error) {
      setNotice(`Status update failed: ${error.message}`);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => (b.status || 'Pending') === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };
  const recent = sortBookingsNewest(bookings).slice(0, 5);

  return (
    <div className="dash-shell">
      <SiteHeader />
      <style>{dashboardCss}</style>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />
      <div className="dash-layout">
        <aside className="dash-side">
          <h3>MANAGEMENT</h3>
          {TABS.map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
          ))}
          <Link className="outline-button dash-view-site" to="/">VIEW SITE <span>-&gt;</span></Link>
        </aside>
        <main className="dash-main">
          <div className="dash-head">
            <div>
              <h1>KPS INN <i>dashboard.</i></h1>
              <p>Manage bookings, gallery images, and the homepage hero slider.</p>
            </div>
            <button className="outline-button" onClick={refresh}>REFRESH DATA</button>
          </div>
          {notice && <p className="dash-notice" role="status">{notice}</p>}
          {busy && <p className="dash-busy" role="status">{busy}</p>}
          {loading ? (
            <div className="dash-loading">Loading…</div>
          ) : (
            <>
              {tab === 'overview' && <OverviewTab stats={stats} recent={recent} onViewAll={() => setTab('bookings')} onOpenBooking={setSelectedBooking} />}
              {tab === 'bookings' && <BookingsTab bookings={bookings} onOpen={setSelectedBooking} onStatus={updateStatus} />}
              {tab === 'gallery' && <GalleryTab gallery={gallery} onAdd={() => startUpload('gallery-add', 'gallery')} onReplace={id => startUpload('gallery-replace', 'gallery', id)} onDelete={deleteGalleryImage} />}
              {tab === 'hero' && <HeroTab slides={slides} onAdd={() => startUpload('hero-add', 'hero')} onReplace={id => startUpload('hero-replace', 'hero', id)} onDelete={deleteSlide} onChanged={refresh} />}
            </>
          )}
        </main>
      </div>
      {selectedBooking && <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatus={updateStatus} />}
    </div>
  );
}

function OverviewTab({ stats, recent, onViewAll, onOpenBooking }) {
  const cards = [
    ['Total Bookings', stats.total],
    ['Pending Bookings', stats.pending],
    ['Confirmed Bookings', stats.confirmed],
    ['Cancelled Bookings', stats.cancelled],
  ];
  return (
    <>
      <div className="stat-grid">
        {cards.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <p>{label}</p>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <section className="dash-card">
        <h2>Recent bookings</h2>
        {recent.length === 0 ? (
          <div className="dash-empty">No bookings yet. When a guest submits the booking form, it will appear here.</div>
        ) : (
          <table className="booking-table">
            <thead><tr><th>Guest</th><th>Room</th><th>Dates</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map(b => (
                <tr key={b.id} onClick={() => onOpenBooking(b)}>
                  <td><b>{b.guestName || b.name || 'Guest'}</b><small>{b.phone || ''}</small></td>
                  <td><b>{b.roomName || b.roomSlug || '—'}</b></td>
                  <td><b>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</b></td>
                  <td><span className={`status-pill ${b.status || 'Pending'}`}>{b.status || 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="gold-button dash-view-all" onClick={onViewAll}>VIEW ALL BOOKINGS <span>-&gt;</span></button>
      </section>
    </>
  );
}

function BookingsTab({ bookings, onOpen, onStatus }) {
  const rows = sortBookingsNewest(bookings);
  return (
    <section className="dash-card">
      <h2>All bookings <small>{rows.length} total</small></h2>
      {rows.length === 0 ? (
        <div className="dash-empty">No bookings yet. When a guest submits the booking form, it will appear here.</div>
      ) : (
        <table className="booking-table">
          <thead><tr><th>Booking</th><th>Guest</th><th>Room</th><th>Dates</th><th>Guests</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(b => (
              <tr key={b.id} onClick={() => onOpen(b)}>
                <td><b>{b.id}</b><small>{formatDateTime(b.bookingDate || b.createdAt)}</small></td>
                <td><b>{b.guestName || b.name || 'Guest'}</b><small>{b.email || ''}{b.phone ? <><br />{b.phone}</> : null}</small></td>
                <td><b>{b.roomName || b.roomSlug || '—'}</b>{b.roomCount > 1 ? <small> × {b.roomCount}</small> : null}</td>
                <td><b>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</b></td>
                <td><b>{b.adults || 0} adult{(b.adults || 0) > 1 ? 's' : ''}</b>{b.children ? <small> + {b.children} child</small> : null}</td>
                <td onClick={event => event.stopPropagation()}>
                  <select className="status-select" aria-label={`Change status for ${b.id}`} value={b.status || 'Pending'} onChange={event => onStatus(b.id, event.target.value)}>
                    {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function BookingModal({ booking: b, onClose, onStatus }) {
  const rows = [
    ['Booking ID', b.id],
    ['Guest Name', b.guestName || b.name || '—'],
    ['Email', b.email || '—'],
    ['Phone Number', b.phone || '—'],
    ['Room Type', b.roomName || b.roomSlug || '—'],
    ['Check-in', formatDate(b.checkIn)],
    ['Check-out', formatDate(b.checkOut)],
    ['Adults', String(b.adults || 0)],
    ['Children', String(b.children || 0)],
    ['Number of Rooms', String(b.roomCount || 1)],
    ['Special Request', b.specialRequest || '—'],
    ['Booking Date/Time', formatDateTime(b.bookingDate || b.createdAt)],
  ];
  return (
    <div className="dash-modal-backdrop" onClick={onClose}>
      <div className="dash-modal" role="dialog" aria-modal="true" aria-label="Booking details" onClick={event => event.stopPropagation()}>
        <button className="dash-modal-close" onClick={onClose} aria-label="Close">×</button>
        <h3>Booking details</h3>
        <dl className="dash-details">
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <label className="dash-status-label">Update status
          <select className="status-select" value={b.status || 'Pending'} onChange={event => onStatus(b.id, event.target.value)}>
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </label>
        <button className="gold-button" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

function GalleryTab({ gallery, onAdd, onReplace, onDelete }) {
  return (
    <section className="dash-card">
      <div className="dash-card-head">
        <h2>Gallery management <small>{gallery.length} images</small></h2>
        <button className="gold-button" onClick={onAdd}>+ ADD IMAGE</button>
      </div>
      {gallery.length === 0 ? (
        <div className="dash-empty">No gallery images yet.</div>
      ) : (
        <div className="gallery-grid">
          {gallery.map(img => (
            <div className="gallery-card" key={img.id}>
              <img src={`/uploads/gallery/${img.filename}`} alt={img.altText || img.title || 'Gallery image'} />
              <div className="gallery-card-body">
                <p>{img.title || img.filename}</p>
                <div className="gallery-card-actions">
                  <button className="outline-button" onClick={() => onReplace(img.id)}>Replace</button>
                  <button className="outline-button danger" onClick={() => onDelete(img.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function HeroTab({ slides, onAdd, onReplace, onDelete, onChanged }) {
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    setDrafts(Object.fromEntries(slides.map(s => [s.id, {
      eyebrow: s.eyebrow || '',
      title: s.title || '',
      copy: s.copy || '',
      cta: s.cta || 'Book Now',
      ctaTarget: s.ctaTarget || 'book',
      motion: s.motion || 'zoom',
    }])));
  }, [slides]);

  const setField = (id, field, value) => setDrafts(d => ({ ...d, [id]: { ...(d[id] || {}), [field]: value } }));

  const saveSlide = async (slide, draft) => {
    try {
      await fetchJson(`/api/hero-slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      await onChanged();
    } catch (error) {
      window.alert(`Save failed: ${error.message}`);
    }
  };

  const move = async (index, dir) => {
    const next = [...slides];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    const a = next[index];
    next[index] = next[swap];
    next[swap] = a;
    try {
      await fetchJson('/api/hero-slides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: next.map(s => s.id) }),
      });
      await onChanged();
    } catch (error) {
      window.alert(`Reorder failed: ${error.message}`);
    }
  };

  return (
    <section className="dash-card">
      <div className="dash-card-head">
        <h2>Hero slider management <small>{slides.length} slides</small></h2>
        <button className="gold-button" onClick={onAdd}>+ ADD SLIDE</button>
      </div>
      {slides.length === 0 ? (
        <div className="dash-empty">No hero slides yet.</div>
      ) : (
        <div className="hero-list">
          {slides.map((slide, index) => {
            const draft = drafts[slide.id] || {};
            return (
              <div className="hero-card" key={slide.id}>
                <div className="hero-card-image"><img src={slide.image} alt={slide.title} /></div>
                <div className="hero-card-body">
                  <div className="hero-card-top">
                    <b>HERO SLIDE {String(index + 1).padStart(2, '0')}</b>
                    <div className="hero-order">
                      <button disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move slide up">↑</button>
                      <button disabled={index === slides.length - 1} onClick={() => move(index, 1)} aria-label="Move slide down">↓</button>
                    </div>
                  </div>
                  <label>Eyebrow<input value={draft.eyebrow || ''} onChange={event => setField(slide.id, 'eyebrow', event.target.value)} /></label>
                  <label>Heading<input value={draft.title || ''} onChange={event => setField(slide.id, 'title', event.target.value)} /></label>
                  <label>Description<textarea rows="2" value={draft.copy || ''} onChange={event => setField(slide.id, 'copy', event.target.value)} /></label>
                  <div className="hero-row">
                    <label>CTA text<input value={draft.cta || ''} onChange={event => setField(slide.id, 'cta', event.target.value)} /></label>
                    <label>CTA target<select value={draft.ctaTarget || 'book'} onChange={event => setField(slide.id, 'ctaTarget', event.target.value)}>
                      {CTA_TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select></label>
                    <label>Motion<select value={draft.motion || 'zoom'} onChange={event => setField(slide.id, 'motion', event.target.value)}>
                      {MOTION_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select></label>
                  </div>
                  <div className="hero-card-actions">
                    <button className="gold-button" onClick={() => saveSlide(slide, draft)}>SAVE</button>
                    <button className="outline-button" onClick={() => onReplace(slide.id)}>REPLACE IMAGE</button>
                    <button className="outline-button danger" onClick={() => onDelete(slide.id)}>DELETE</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
