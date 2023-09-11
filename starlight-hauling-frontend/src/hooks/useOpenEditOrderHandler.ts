import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { differenceInDays } from 'date-fns';

import { NotificationHelper } from '@root/helpers';

const I18N_PATH = 'quickViews.OrderQuickView.OrderInformation.Text.';

interface IEditOrder {
  serviceDate?: Date;
  openEdit(): void;
}

export const useOpenEditOrderHandler = ({ serviceDate, openEdit }: IEditOrder) => {
  const { t } = useTranslation();
  const handleOpenEditOrderInProgress = useCallback(() => {
    const currentDate = new Date();
    const canEditOrder = serviceDate && differenceInDays(currentDate, serviceDate) <= 0;

    if (canEditOrder) {
      openEdit();
    } else {
      NotificationHelper.custom('warn', t(`${I18N_PATH}EditOrderOrderWarning`));
    }
  }, [openEdit, serviceDate, t]);

  return { handleOpenEditOrderInProgress };
};
