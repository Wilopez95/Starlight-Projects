import { QueryContext } from './QueryContext';
import Me from './Me';

export interface UserContext extends Partial<Omit<QueryContext, 'userInfo'>> {
  userInfo: Me;
  reqId?: string;
}
