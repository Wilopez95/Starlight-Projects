import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';

import { OrderService } from '@root/api';
import { getPriceType, NotificationHelper } from '@root/helpers';
import { useBusinessContext, useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { isCustomPriceGroup } from '@root/pages/NewRequest/NewRequestForm/guards';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Subscription.hooks.Error.';

export const useHandleSelectRatesChange = () => {
  const { values, initialValues, setFieldValue } = useFormikContext<INewSubscription>();
  const { timeZone } = useTimeZone();
  const intl = useIntl();
  const { t } = useTranslation();
  const { jobSiteStore, customerStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [loading, setLoading] = useState<boolean>(true);

  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (values.startDate && selectedCustomer && selectedJobSite) {
        try {
          const selectedGroup = await OrderService.selectRatesGroup({
            businessUnitId,
            businessLineId: values.businessLineId,
            customerId: selectedCustomer.id,
            customerJobSiteId: values.customerJobSiteId ?? null,
            date: values.startDate,
            serviceAreaId: values.serviceAreaId,
          });

          if (isCustomPriceGroup(selectedGroup)) {
            setFieldValue(
              'customRatesGroupOptions',
              selectedGroup.customRatesGroups.map(customRatesGroup => ({
                value: customRatesGroup.id,
                label: customRatesGroup.description,
                hint: getPriceType(customRatesGroup, t),
              })),
            );
            if (values.startDate !== initialValues.startDate) {
              // select custom rates group on startDate change
              setFieldValue('customRatesGroupId', selectedGroup.selectedId);
            }
          } else {
            setFieldValue('customRatesGroupOptions', []);
          }
        } catch (error) {
          NotificationHelper.error('default');
        }
        setLoading(false);
      }
    })();
  }, [
    businessUnitId,
    intl,
    selectedCustomer,
    selectedJobSite,
    setFieldValue,
    t,
    timeZone,
    values.businessLineId,
    values.customerJobSiteId,
    values.serviceAreaId,
    values.startDate,
    setLoading,
    initialValues.startDate,
  ]);

  useEffect(() => {
    if (
      !loading &&
      values.customRatesGroupId &&
      !values.customRatesGroupOptions.some(({ value }) => value === values.customRatesGroupId)
    ) {
      NotificationHelper.custom('warn', t(`${I18N_PATH}StartDateChangeWarn`));
      setFieldValue('customRatesGroupId', 0);
    }
  }, [values.customRatesGroupOptions, values.customRatesGroupId, t, setFieldValue, loading]);
};
