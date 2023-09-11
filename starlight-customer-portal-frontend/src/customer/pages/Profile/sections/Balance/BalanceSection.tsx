import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Currency } from '@root/core/components';
import { useStores } from '@root/core/hooks';

const I18N_PATH = 'pages.Profile.BalanceSection.';

const BalanceSection: React.FC = () => {
  const { customerStore } = useStores();
  const { t } = useTranslation();

  const balances = customerStore.selectedEntity?.balances;

  return (
    <>
      <Typography variant='bodyLarge' fontWeight='bold' shade='dark'>
        {t(`${I18N_PATH}title`)}
      </Typography>
      <Layouts.Margin top='3'>
        <Layouts.Box backgroundColor='grey' backgroundShade='desaturated'>
          <Layouts.Padding padding='3'>
            <Layouts.Grid columns='1fr 20px auto'>
              <Layouts.Cell area='1 / 1'>
                <Layouts.Padding bottom='1'>
                  <Typography fontWeight='semiBold' color='secondary' shade='light'>
                    {t(`${I18N_PATH}title`)}:
                  </Typography>
                </Layouts.Padding>
              </Layouts.Cell>
              <Layouts.Cell area='1 / 3'>
                <Layouts.Padding bottom='1'>
                  <Currency value={balances?.balance} fontWeight='bold' variant='bodyLarge' />
                </Layouts.Padding>
              </Layouts.Cell>

              <Layouts.Cell area='2 / 1'>
                <Layouts.Padding bottom='1' top='1'>
                  <Typography color='secondary' shade='light'>
                    {t(`${I18N_PATH}creditLimit`)}:
                  </Typography>
                </Layouts.Padding>
              </Layouts.Cell>
              <Layouts.Cell area='2 / 3'>
                <Layouts.Padding bottom='1' top='1'>
                  <Currency value={balances?.creditLimit} />
                </Layouts.Padding>
              </Layouts.Cell>

              <Layouts.Cell area='3 / 1'>
                <Layouts.Padding bottom='1' top='1'>
                  <Typography color='secondary' shade='light'>
                    {t(`${I18N_PATH}prepaidOnAccount`)}:
                  </Typography>
                </Layouts.Padding>
              </Layouts.Cell>
              <Layouts.Cell area='3 / 3'>
                <Layouts.Padding bottom='1' top='1'>
                  <Currency value={balances?.prepaidOnAccount} />
                </Layouts.Padding>
              </Layouts.Cell>

              <Layouts.Cell area='4 / 1'>
                <Layouts.Padding bottom='1' top='1'>
                  <Typography color='secondary' shade='light'>
                    {t(`${I18N_PATH}availableCredit`)}:
                  </Typography>
                </Layouts.Padding>
              </Layouts.Cell>
              <Layouts.Cell area='4 / 3'>
                <Layouts.Padding bottom='1' top='1'>
                  <Currency alertWhenNegative value={balances?.availableCredit} />
                </Layouts.Padding>
              </Layouts.Cell>

              <Layouts.Cell area='5 / 1 / 5 / 4'>
                <Layouts.Margin top='3' bottom='3'>
                  <Layouts.Box borderColor='grey' borderShade='dark' />
                </Layouts.Margin>
              </Layouts.Cell>

              <Layouts.Cell area='6 / 1'>
                <Layouts.Padding bottom='1' top='1'>
                  <Typography color='secondary' shade='light'>
                    {t(`${I18N_PATH}nonInvoicedTotal`)}:
                  </Typography>
                </Layouts.Padding>
              </Layouts.Cell>
              <Layouts.Cell area='6 / 3'>
                <Layouts.Padding bottom='1' top='1'>
                  <Currency value={balances?.nonInvoicedTotal} />
                </Layouts.Padding>
              </Layouts.Cell>

              <Layouts.Cell area='7 / 1'>
                <Layouts.Padding bottom='1' top='1'>
                  <Typography color='secondary' shade='light'>
                    {t(`${I18N_PATH}prepaidDeposits`)}:
                  </Typography>
                </Layouts.Padding>
              </Layouts.Cell>
              <Layouts.Cell area='7 / 3'>
                <Layouts.Padding bottom='1' top='1'>
                  <Currency value={balances?.prepaidDeposits} />
                </Layouts.Padding>
              </Layouts.Cell>

              <Layouts.Cell area='8 / 1'>
                <Layouts.Padding bottom='1' top='1'>
                  <Typography color='secondary' shade='light'>
                    {t(`${I18N_PATH}paymentDue`)}:
                  </Typography>
                </Layouts.Padding>
              </Layouts.Cell>
              <Layouts.Cell area='8 / 3'>
                <Layouts.Padding bottom='1' top='1'>
                  <Currency value={balances?.paymentDue} />
                </Layouts.Padding>
              </Layouts.Cell>
            </Layouts.Grid>
          </Layouts.Padding>
        </Layouts.Box>
      </Layouts.Margin>
    </>
  );
};

export default observer(BalanceSection);
