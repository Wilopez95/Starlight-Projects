import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';

import styles from '../../css/styles.scss';

interface ICustomerNotesSection {
  isWalkUpCustomer: boolean;
  generalNote?: string;
  popupNote?: string;
  billingNote?: string;
  workOrderNote?: string;
}

const fallback = '-';
const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.Text.';

const CustomerNotesSection: React.FC<ICustomerNotesSection> = ({
  isWalkUpCustomer,
  generalNote,
  popupNote,
  billingNote,
  workOrderNote,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography className={styles.sectionHeading} variant="bodyLarge" fontWeight="bold">
        {t(`${I18N_PATH}CustomerNotes`)}
      </Typography>
      <Layouts.Flex direction="column">
        <Typography>{t(`${I18N_PATH}GeneralNote`)}</Typography>
        <Layouts.Margin top="1" bottom="2">
          <Typography>{generalNote ?? fallback}</Typography>
        </Layouts.Margin>
        <Typography>{t(`${I18N_PATH}PopupNote`)}</Typography>
        <Layouts.Margin top="1" bottom="2">
          <Typography>{popupNote ?? fallback}</Typography>
        </Layouts.Margin>
        {!isWalkUpCustomer ? (
          <>
            <Typography>{t(`${I18N_PATH}BillingPopUp`)}</Typography>
            <Layouts.Margin top="1" bottom="2">
              <Typography>{billingNote ?? fallback}</Typography>
            </Layouts.Margin>
          </>
        ) : null}
        <Typography>{t(`${I18N_PATH}WorkOrderNote`)}</Typography>
        <Layouts.Margin top="1" bottom="2">
          <Typography>{workOrderNote ?? fallback}</Typography>
        </Layouts.Margin>
      </Layouts.Flex>
    </>
  );
};

export default CustomerNotesSection;
