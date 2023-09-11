import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { IPeriodComponent } from './types';

const BillingPeriod: React.FC<IPeriodComponent> = ({ periodFrom, periodTo }) => {
  const { formatDateTime } = useIntl();

  return (
    <Layouts.Padding top="1" bottom="1">
      <Layouts.Box backgroundColor="grey" backgroundShade="light">
        <Layouts.Padding padding="0.5" left="1" right="1">
          <Typography
            variant="bodySmall"
            color="secondary"
            shade="desaturated"
            fontWeight="medium"
            textTransform="uppercase"
          >
            {formatDateTime(periodFrom).date} - {formatDateTime(periodTo).date}
          </Typography>
        </Layouts.Padding>
      </Layouts.Box>
    </Layouts.Padding>
  );
};

export default observer(BillingPeriod);
