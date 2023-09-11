import { PATHNAME_REGEX } from '../constants/regex';

export default function getLogoutLink() {
  const basenameMatch = window.location.pathname.match(PATHNAME_REGEX);
  let basename = '';

  if (basenameMatch) {
    basename = basenameMatch[0];
  }
  const { protocol, host } = window.location;
  const loginUrl = `${protocol}//${host}${basename}/login`;

  return `/TODO-ADD_API-HOST-LOGOUT/logout?redirectTo=${encodeURIComponent(loginUrl)}`;
}
