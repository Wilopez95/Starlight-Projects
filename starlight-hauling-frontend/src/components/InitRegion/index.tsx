import React, { useEffect } from 'react';

import { CompanyService } from '@root/api';
import { NotificationHelper } from '@root/helpers';
import { useStores } from '@hooks';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';

export const InitRegion: React.FunctionComponent = () => {
  const { i18nStore } = useStores();

  useEffect(() => {
    (async () => {
      try {
        const { region } = await CompanyService.getRegionalSettings();

        if (region) {
          i18nStore.setRegion(region);
        }
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('default', typedError.response.code as ActionCode);
      }
    })();
  }, [i18nStore]);

  return null;
};
