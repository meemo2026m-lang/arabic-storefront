export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Supabase authentication is performed by the ERP login form.  Returning to
// the root URL displays that form after an expired session.
export const startLogin = () => {
  window.location.assign("/");
};
