import { TFunction } from 'i18next';

import { IResource, ResourceType } from '@root/types';

const I18N_PATH =
  'pages.SystemConfiguration.tables.UsersAndRoles.components.Permissions.helpers.Text.';

export const formatResource = (resource: IResource, t: TFunction): string => {
  switch (resource.type) {
    case ResourceType.HAULING:
    case ResourceType.RECYCLING:
      return resource.label ?? `Business unit ${resource.srn}`;
    case ResourceType.GLOBAL:
      return t(`${I18N_PATH}GlobalPermissions`);
    default:
      return '';
  }
};

export const formatResourceType = (
  type: ResourceType.HAULING | ResourceType.RECYCLING,
  t: TFunction,
): string => {
  switch (type) {
    case ResourceType.HAULING:
      return t(`${I18N_PATH}Hauling`);
    case ResourceType.RECYCLING:
      return t(`${I18N_PATH}Recycling`);
    default:
      return '';
  }
};
