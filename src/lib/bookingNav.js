import { useLocation, useNavigate } from 'react-router-dom';

let pendingFocus = false;

export const FOCUS_EVENT_NAME = 'kps:focus-booking-form';

export const requestBookingFormFocus = () => {
  pendingFocus = true;
};

export const consumeBookingFormFocus = () => {
  const wasPending = pendingFocus;
  pendingFocus = false;
  return wasPending;
};

export const dispatchBookingFormFocus = () => {
  window.dispatchEvent(new CustomEvent(FOCUS_EVENT_NAME));
};

export const useGoToBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    requestBookingFormFocus();
    if (location.pathname === '/') {
      consumeBookingFormFocus();
      dispatchBookingFormFocus();
    } else {
      navigate('/');
    }
  };
};
