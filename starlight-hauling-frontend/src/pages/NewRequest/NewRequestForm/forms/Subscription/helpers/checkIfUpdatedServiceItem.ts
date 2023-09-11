import { isEqual, pick } from 'lodash-es';

import { editableServiceItemProps } from '../formikData';
import { INewSubscriptionService } from '../types';

export const checkIfUpdatedServiceItem = (
  service: INewSubscriptionService,
  initialService?: INewSubscriptionService,
) =>
  !isEqual(pick(service, editableServiceItemProps), pick(initialService, editableServiceItemProps));
