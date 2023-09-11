import { TRASH_API_URL } from '@root/helpers/config';
import makeUrl from './makeUrl';

export default function makeApiUrl(endpoint, queryParams = {}) {
  return makeUrl(`${TRASH_API_URL}/${endpoint}`, queryParams);
}
