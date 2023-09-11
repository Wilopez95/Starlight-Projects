import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography, ValidationMessageBlock } from '@root/common';

const I18N_PATH = 'components.forms.CustomersOnHold.Form.';

const NoSubscriptionsMessage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layouts.Padding left="5" right="5" bottom="2">
      <ValidationMessageBlock
        width="100%"
        color="primary"
        shade="desaturated"
        textColor="secondary"
        borderRadius="4px"
      >
        <Typography>{t(`${I18N_PATH}NoSubscriptionsMessage`)}</Typography>
      </ValidationMessageBlock>
    </Layouts.Padding>
  );
};

export default observer(NoSubscriptionsMessage);
