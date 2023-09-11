import { IModal } from '@starlightpro/shared-components';

import { PublishRouteFormValues } from './formikData';

export interface IPublishRouteForm extends IModal {
  onPublish: (data: PublishRouteFormValues) => void;
}
