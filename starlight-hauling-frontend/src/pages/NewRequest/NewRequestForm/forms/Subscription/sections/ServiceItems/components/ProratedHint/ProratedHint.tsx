import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { InfoIcon } from '@root/assets';
import { Tooltip, Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { IProratedHint } from './types';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.Text.';

const ProratedHint: React.FC<IProratedHint> = ({ effectiveDate }) => {
  const { formatDateTime } = useIntl();

  const { t } = useTranslation();

  const message = useMemo(
    () => t(`${I18N_PATH}ProratedHint`, { effectiveDate: formatDateTime(effectiveDate).date }),
    [effectiveDate, formatDateTime, t],
  );

  return (
    <Tooltip position="top" text={message} normalizeTypography={false}>
      <Typography color="primary">
        <InfoIcon />
      </Typography>
    </Tooltip>
  );
};

export default observer(ProratedHint);
