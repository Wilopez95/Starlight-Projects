import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Section, Subsection, Typography } from '@root/common';
import ContactSelect from '@root/components/ContactSelect/ContactSelect';
import OrderTimePicker from '@root/components/OrderTimePicker/OrderTimePicker';
import PermitSelect from '@root/components/PermitSelect/PermitSelect';
import PriceGroupSelect from '@root/components/PriceGroupSelect/PriceGroupSelect';
import PurchaseOrderSection from '@root/components/PurchaseOrderSection/PurchaseOrderSection';
import ThirdPartyHaulerSelect from '@root/components/ThirdPartyHaulerSelect/ThirdPartyHaulerSelect';
import { BusinessLineType } from '@root/consts';
import { isPastDate } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import RouteSelect from '@root/quickViews/components/RouteSelect/RouteSelect';
import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';
import { SubscriptionWorkOrderStatusEnum } from '@root/types';

const today = new Date();

const I18N_PATH = 'quickViews.SubscriptionWorkOrderEditQuickView.components.OrderDetails.';

const OrderSection: React.FC = () => {
  const { values, errors, handleChange, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionWorkOrder>();

  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  const { subscriptionStore, subscriptionWorkOrderStore } = useStores();
  const subscription = subscriptionStore.selectedEntity;
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;
  const customerId = subscription?.customer?.originalId;

  const businessLineType = subscription?.businessLine.type;

  const hasPermits = useMemo(
    () =>
      businessLineType &&
      [BusinessLineType.rollOff, BusinessLineType.portableToilets].includes(businessLineType),
    [businessLineType],
  );

  const isScheduledOrInProgress = useMemo(
    () =>
      subscriptionWorkOrder?.status &&
      [
        SubscriptionWorkOrderStatusEnum.scheduled,
        SubscriptionWorkOrderStatusEnum.inProgress,
      ].includes(subscriptionWorkOrder.status),
    [subscriptionWorkOrder?.status],
  );

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
            <ContactSelect
              label={t(`${I18N_PATH}ContactSelect`)}
              placeholder={t(`${I18N_PATH}ContactSelectPlaceholder`)}
              name="subscriptionContactId"
              customerId={customerId}
              value={values.subscriptionContactId}
              onSelectChange={setFieldValue}
              disabled
            />
            <PurchaseOrderSection disabled customerId={customerId} />
            {hasPermits ? (
              <PermitSelect
                placeholder={t(`${I18N_PATH}PermitSelectPlaceholder`)}
                label={t(`${I18N_PATH}PermitSelect`)}
                name="permitId"
                businessLineId={subscription?.businessLine.id}
                businessUnitId={subscription?.businessUnit.id}
                value={values.permitId ?? undefined}
                onSelectChange={setFieldValue}
                disabled
              />
            ) : null}
            {values.thirdPartyHaulerId ? (
              <ThirdPartyHaulerSelect
                label={t(`${I18N_PATH}ThirdPartyHaulerSelect`)}
                placeholder={t(`${I18N_PATH}ThirdPartyHaulerSelectPlaceholder`)}
                name="thirdPartyHaulerId"
                value={values.thirdPartyHaulerId}
                onSelectChange={setFieldValue}
                disabled
              />
            ) : null}
            <Calendar
              label={t(`${I18N_PATH}ServiceDate`)}
              name="serviceDate"
              withInput
              value={values.serviceDate}
              error={errors.serviceDate}
              minDate={today}
              onDateChange={setFieldValue}
              readOnly={!isScheduledOrInProgress || isPastDate(values.serviceDate)}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              formatDate={formatDate}
            />
            <PriceGroupSelect
              label={t(`${I18N_PATH}PriceGroupSelect`)}
              name="customRatesGroupServicesId"
              value={values.customRatesGroupServicesId ?? undefined}
              onSelectChange={setFieldValue}
              disabled
            />
            {subscription?.serviceArea ? (
              <RouteSelect
                label={t(`${I18N_PATH}PreferredRoute`)}
                placeholder={t(`${I18N_PATH}PreferredRoutePlaceholder`)}
                name="assignedRoute"
                onSelectChange={setFieldValue}
                value={values.assignedRoute}
                serviceDate={values.serviceDate}
                serviceAreaId={
                  subscription?.serviceArea?.originalId ?? subscription?.serviceArea?.id
                }
                businessLineType={businessLineType}
              />
            ) : null}
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              label={t(`${I18N_PATH}InstructionsForDriver`)}
              name="instructionsForDriver"
              value={values.instructionsForDriver}
              onChange={handleChange}
              area
            />
            <OrderTimePicker disabled />
            <Layouts.Flex>
              <Layouts.Column>
                {businessLineType !== BusinessLineType.residentialWaste ? (
                  <Checkbox
                    name="someoneOnSite"
                    onChange={handleChange}
                    value={values.someoneOnSite ?? undefined}
                    disabled
                  >
                    {t(`${I18N_PATH}SomeoneOnSite`)}
                  </Checkbox>
                ) : null}
                <Layouts.Margin top="1" bottom="1">
                  <Checkbox
                    name="alleyPlacement"
                    value={values.alleyPlacement}
                    onChange={noop}
                    disabled
                  >
                    {t(`${I18N_PATH}AlleyPlacement`)}
                  </Checkbox>
                </Layouts.Margin>
              </Layouts.Column>
              <Layouts.Column>
                <Layouts.Margin bottom="1">
                  <Checkbox
                    name="highPriority"
                    value={values.highPriority}
                    onChange={noop}
                    disabled
                  >
                    {t(`${I18N_PATH}HighPriority`)}
                  </Checkbox>
                </Layouts.Margin>
              </Layouts.Column>
            </Layouts.Flex>
            <Layouts.Margin top="1">
              <FormInput
                placeholder={t('Text.DroppedEquipment')}
                label={`${t('Text.DroppedEquipment')} #`}
                name="droppedEquipmentItem"
                value={values.droppedEquipmentItem}
                onChange={handleChange}
                disabled
              />
              <FormInput
                placeholder={t('Text.PickedUpEquipment')}
                label={`${t('Text.PickedUpEquipment')} #`}
                name="pickedUpEquipmentItem"
                value={values.pickedUpEquipmentItem}
                onChange={handleChange}
                disabled
              />
            </Layouts.Margin>
          </Layouts.Column>
        </Layouts.Flex>
      </Subsection>
    </Section>
  );
};

export default observer(OrderSection);
