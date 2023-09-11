import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts } from '@starlightpro/shared-components';
import { startOfTomorrow } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Section, Subsection, Typography } from '@root/common';
import PriceGroupSelect from '@root/components/PriceGroupSelect/PriceGroupSelect';
import PurchaseOrderSection from '@root/components/PurchaseOrderSection/PurchaseOrderSection';
import ThirdPartyHaulerSelect from '@root/components/ThirdPartyHaulerSelect/ThirdPartyHaulerSelect';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import LineItems from '@root/quickViews/SubscriptionOrderEdit/components/LineItems/LineItems';
import { IConfigurableSubscriptionOrder } from '@root/types';

const tomorrow = startOfTomorrow();

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.OrderDetails.';

const OrderSection: React.FC = () => {
  const { values, errors, handleChange, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionOrder>();
  const { materialStore } = useStores();
  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  useEffect(() => {
    materialStore.request({ businessLineId: values.businessLineId, activeOnly: true });
  }, [materialStore, values.businessLineId]);

  return (
    <Section>
      <Subsection>
        <Layouts.Margin bottom="1">
          <Layouts.Flex justifyContent="space-between">
            <Typography variant="headerThree">{t(`${I18N_PATH}Header`)}</Typography>
          </Layouts.Flex>
        </Layouts.Margin>
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Column>
            <PurchaseOrderSection customerId={values.customerId} />
            {values.thirdPartyHaulerId ? (
              <ThirdPartyHaulerSelect
                label={t(`${I18N_PATH}ThirdPartyHaulerSelect`)}
                placeholder={t(`${I18N_PATH}ThirdPartyHaulerSelectPlaceholder`)}
                name="thirdPartyHaulerId"
                value={values.thirdPartyHaulerId}
                error={errors.thirdPartyHaulerId}
                onSelectChange={setFieldValue}
                nonClearable
              />
            ) : null}
            <Calendar
              label={t(`${I18N_PATH}ServiceDate`)}
              name="serviceDate"
              withInput
              value={values.serviceDate}
              minDate={tomorrow}
              onDateChange={setFieldValue}
              readOnly
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              formatDate={formatDate}
            />
            <PriceGroupSelect
              label={t(`${I18N_PATH}PriceGroupSelect`)}
              placeholder={t(`${I18N_PATH}PriceGroupSelectPlaceholder`)}
              name="customRatesGroupServicesId"
              value={values.customRatesGroupServicesId ?? undefined}
              error={errors.customRatesGroupServicesId}
              onSelectChange={setFieldValue}
            />
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              label={t(`${I18N_PATH}InstructionsForDriver`)}
              placeholder={t(`${I18N_PATH}InstructionsForDriverPlaceholder`)}
              name="instructionsForDriver"
              value={values.instructionsForDriver}
              onChange={handleChange}
              area
              disabled
            />
          </Layouts.Column>
        </Layouts.Flex>
      </Subsection>
      <Subsection gray>
        <LineItems />
      </Subsection>
    </Section>
  );
};

export default observer(OrderSection);
