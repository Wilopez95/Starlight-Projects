import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography, ValidationMessageBlock } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { IProratedMessage } from './types';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.Text.';

const ProratedMessage: React.FC<IProratedMessage> = ({ effectiveDate }) => {
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  return (
    <Layouts.Padding left="3" right="3" bottom="2">
      <ValidationMessageBlock
        width="100%"
        color="primary"
        shade="desaturated"
        textColor="secondary"
        borderRadius="4px"
      >
        <Layouts.Flex justifyContent="space-between" alignItems="center">
          <Typography>
            {t(`${I18N_PATH}ProratedMessage`, {
              effectiveDate: formatDateTime(effectiveDate).date,
            })}
          </Typography>
        </Layouts.Flex>
      </ValidationMessageBlock>
    </Layouts.Padding>
  );
};

export default observer(ProratedMessage);
