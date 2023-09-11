import { createBrowserHistory } from 'history';
import { PATHNAME_REGEX } from '../constants/regex';

const basenameMatch = window.location.pathname.match(PATHNAME_REGEX);

let basename = '/';

if (basenameMatch) {
  basename = basenameMatch[0];
}

export default createBrowserHistory({
  basename,
});
