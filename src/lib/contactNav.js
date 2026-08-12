import { useLocation, useNavigate } from 'react-router-dom';

export const CONTACT_FOOTER_ID = 'footer';

let pendingScroll = false;

export const requestContactScroll = () => {
  pendingScroll = true;
};

export const consumeContactScroll = () => {
  const wasPending = pendingScroll;
  pendingScroll = false;
  return wasPending;
};

const scrollToFooter = (center = false) => {
  const element = document.getElementById(CONTACT_FOOTER_ID);
  if (!element) return false;
  element.scrollIntoView({ behavior: 'smooth', block: center ? 'center' : 'start' });
  return true;
};

export const performPendingContactScroll = () => {
  if (!consumeContactScroll()) return;
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      const done = scrollToFooter(true);
      if (!done) {
        window.setTimeout(() => scrollToFooter(true), 200);
      }
    }, 60);
  });
};

export const useGoToContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (location.pathname === '/') {
      scrollToFooter(false);
      return;
    }
    requestContactScroll();
    navigate('/');
  };
};
