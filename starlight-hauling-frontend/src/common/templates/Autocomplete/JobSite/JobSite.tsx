import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  AutocompleteOptionContext,
  HighlightDecorator,
  RedirectButton,
} from '@starlightpro/shared-components';

import { Typography } from '@root/common/Typography/Typography';
import { useStores } from '@root/hooks';
import { AddressSuggestion } from '@root/types/responseEntities';

import { I18N_TEMPLATE_PATH } from '../helpers';

import { IJobSiteComponent } from './types';

export const JobSite: React.FC<IJobSiteComponent> = ({ redirectPath }) => {
  const item = useContext<AddressSuggestion>(
    AutocompleteOptionContext as React.Context<AddressSuggestion>,
  );
  const { t } = useTranslation();

  const { address, city, state, zip, id } = item;
  const { jobSiteStore, customerStore } = useStores();

  const history = useHistory();
  const handleRedirect = useCallback(
    (e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>) => {
      e.stopPropagation();
      if (redirectPath) {
        jobSiteStore.requestById(id);
        customerStore.unSelectEntity();
        history.push(redirectPath);
      }
    },
    [customerStore, history, id, jobSiteStore, redirectPath],
  );

  return (
    <>
      <div>
        <Typography variant="bodyMedium">
          <HighlightDecorator highlight={item.highlight} property="address">
            {address}
          </HighlightDecorator>
        </Typography>
        <Typography color="secondary" variant="bodyMedium" shade="desaturated">
          {[city, state, zip].join(', ')}
        </Typography>
      </div>
      {redirectPath ? (
        <RedirectButton onClick={handleRedirect}>
          {t(`${I18N_TEMPLATE_PATH}JobSite.PlaceNewService`)}
        </RedirectButton>
      ) : null}
    </>
  );
};
