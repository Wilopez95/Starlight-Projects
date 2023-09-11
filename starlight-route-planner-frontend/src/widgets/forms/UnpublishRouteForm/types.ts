import { IModal } from '@starlightpro/shared-components';

import { IUnpublishMasterRouteNotice } from '@root/types';

export interface IUnpublishRouteForm extends IModal {
  unpublishInfo?: IUnpublishMasterRouteNotice;
  onUnpublish: () => void;
}
