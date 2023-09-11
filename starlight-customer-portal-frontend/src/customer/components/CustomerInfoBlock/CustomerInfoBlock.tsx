import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Currency } from '@root/core/components';
import { useRegionConfig, useStores } from '@root/core/hooks';

const I18N_PATH = 'modules.customer.components.CustomerInfoBlock.';

const CustomerInfoBlock: React.FC = () => {
  const { customerStore } = useStores();
  const { t } = useTranslation();
  const { currencySymbol } = useRegionConfig();

  const balances = customerStore.selectedEntity?.balances ?? {};

  return (
    <Layouts.Flex justifyContent='flex-end' as={Layouts.Padding} padding='3' top='4'>
      <Layouts.Grid columns='1fr 20px auto' as={Layouts.Box} width='auto'>
        <Layouts.Cell area='1 / 1'>
          <Layouts.Padding bottom='2'>
            <Typography color='secondary' shade='light' textAlign='right'>
              {t(`${I18N_PATH}Balance`)}, {currencySymbol}:
            </Typography>
          </Layouts.Padding>
        </Layouts.Cell>
        <Layouts.Cell area='1 / 3'>
          <Layouts.Padding bottom='2'>
            <Currency value={balances?.balance} variant='bodyLarge' fontWeight='bold' />
          </Layouts.Padding>
        </Layouts.Cell>

        <Layouts.Cell area='2 / 1'>
          <Layouts.Padding bottom='1'>
            <Typography color='secondary' shade='light' textAlign='right'>
              {t(`${I18N_PATH}OrdersTotal`)}, {currencySymbol}:
            </Typography>
          </Layouts.Padding>
        </Layouts.Cell>
        <Layouts.Cell area='2 / 3'>
          <Layouts.Padding bottom='1'>
            <Currency value={balances?.nonInvoicedTotal} />
          </Layouts.Padding>
        </Layouts.Cell>

        <Layouts.Cell area='3 / 1'>
          <Layouts.Padding bottom='1'>
            <Typography color='secondary' shade='light' textAlign='right'>
              {t(`${I18N_PATH}AvailableCredit`)}, {currencySymbol}:
            </Typography>
          </Layouts.Padding>
        </Layouts.Cell>
        <Layouts.Cell area='3 / 3'>
          <Layouts.Padding bottom='1'>
            <Currency alertWhenNegative value={balances?.availableCredit} />
          </Layouts.Padding>
        </Layouts.Cell>
      </Layouts.Grid>
    </Layouts.Flex>
  );
};

export default observer(CustomerInfoBlock);
