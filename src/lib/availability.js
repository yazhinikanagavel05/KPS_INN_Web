const STORAGE_KEY = 'kps-inn-bookings';

const pad = n => String(n).padStart(2, '0');

export const toDateString = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = () => toDateString(new Date());

export const addDays = (dateString, amount) => {
  if (!dateString) return '';
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + amount);
  return toDateString(d);
};

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = end - start;
  return diff > 0 ? Math.round(diff / 86400000) : 0;
}

export function eachNight(checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  const dates = [];
  for (let i = 0; i < nights; i += 1) {
    const d = new Date(`${checkIn}T00:00:00`);
    d.setDate(d.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  try {
    const all = loadBookings();
    all.push({ id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), ...booking });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable — availability simply stays unaffected
  }
}

export function getRoomAvailability({ checkIn, checkOut, roomSlug, inventory, requested = 1 }) {
  const dates = eachNight(checkIn, checkOut);
  if (!dates.length) return { available: false, nights: 0, availableUnits: 0, maxBooked: 0, dates };
  const bookings = loadBookings().filter(b => b.roomSlug === roomSlug && b.checkIn && b.checkOut);
  const bookedPerNight = dates.map(date =>
    bookings
      .filter(b => b.checkIn <= date && date < b.checkOut)
      .reduce((sum, b) => sum + (Number(b.roomCount) || 1), 0)
  );
  const maxBooked = Math.max(0, ...bookedPerNight);
  const availableUnits = Math.max(0, inventory - maxBooked);
  return { available: availableUnits >= requested, nights: dates.length, availableUnits, maxBooked, dates };
}

export const groupFitsRoom = (room, guests, roomCount) => room.capacity * roomCount >= guests;

export const minimumRoomsNeeded = (rooms, guests) => {
  const maxCapacity = Math.max(0, ...rooms.map(room => room.capacity || 0));
  return maxCapacity > 0 ? Math.max(1, Math.ceil(guests / maxCapacity)) : 1;
};

export const bestFitRoomSlug = (rooms, guests) => {
  const sorted = [...rooms].sort((a, b) => (a.capacity - b.capacity) || (a.price - b.price));
  const single = sorted.find(room => room.capacity >= guests);
  if (single) return single.slug;
  return sorted.reduce((best, room) => (room.capacity > best.capacity ? room : best), sorted[0]).slug;
};

export function getRoomCombinations({ rooms, guests, roomCount, availableUnits }) {
  const types = rooms.filter(room => room.capacity > 0);
  const results = [];
  const combo = [];
  const typeOf = slug => types.find(room => room.slug === slug);
  const build = start => {
    if (combo.length === roomCount) {
      const counts = {};
      combo.forEach(slug => { counts[slug] = (counts[slug] || 0) + 1; });
      const capacity = combo.reduce((sum, slug) => sum + typeOf(slug).capacity, 0);
      if (capacity >= guests) {
        const available = availableUnits
          ? Object.entries(counts).every(([slug, n]) => (availableUnits[slug] || 0) >= n)
          : true;
        if (available) results.push({ counts, capacity, price: combo.reduce((sum, slug) => sum + typeOf(slug).price, 0) });
      }
      return;
    }
    for (let i = start; i < types.length; i += 1) {
      combo.push(types[i].slug);
      build(i);
      combo.pop();
    }
  };
  build(0);
  return results.sort((a, b) => a.price - b.price || a.capacity - b.capacity);
}
