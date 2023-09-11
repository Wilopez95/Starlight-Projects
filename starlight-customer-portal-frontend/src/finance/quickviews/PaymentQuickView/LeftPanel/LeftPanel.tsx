import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { LeftPanelTools } from '@root/core/common/TableTools';
import { useIntl } from '@root/core/i18n/useIntl';
import { IQuickViewLeftPanel } from '@root/customer/quickViews/types';
import { NewUnappliedPayment } from '@root/finance/types/entities';

const I18N_PATH = 'modules.finance.components.InvoicePaymentQuickView.';

export const LeftPanel: React.FC<IQuickViewLeftPanel> = () => {
  const { formatCurrency } = useIntl();
  const {
    values: { prevBalance = 0, amount = 0, applications },
  } = useFormikContext<NewUnappliedPayment>();
  const { t } = useTranslation();
  const newBalance = prevBalance - amount;

  const [paymentAmount, setAmount] = useState(0);

  useEffect(() => {
    setAmount(applications.reduce((acc, elem) => acc + elem.amount, 0));
  }, [applications]);

  return (
    <LeftPanelTools.Panel>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item>
          <Typography fontWeight='bold' variant='headerThree'>
            {t(`${I18N_PATH}NewPayment`)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color='secondary'>{t(`${I18N_PATH}PreviousAccBalance`)}</Typography>
          <Typography variant='bodyLarge'>{formatCurrency(prevBalance)}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color='secondary'>{t(`${I18N_PATH}PaymentAmount`)}</Typography>
          <Typography variant='bodyLarge'>{formatCurrency(paymentAmount)}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color='secondary' fontWeight='bold'>
            {t(`${I18N_PATH}NewBalance`)}:
          </Typography>
          <Typography variant='bodyLarge' fontWeight='bold'>
            {formatCurrency(newBalance)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
