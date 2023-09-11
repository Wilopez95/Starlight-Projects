import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput } from '@root/common';
import { Divider } from '@root/common/TableTools';
import PhoneNumber from '@root/components/PhoneNumber/PhoneNumber';
import PhoneNumberAdd from '@root/components/PhoneNumber/PhoneNumberAdd';
import PurchaseOrderSelect from '@root/components/PurchaseOrderSelect/PurchaseOrderSelect';
import { purchaseOrdersToSelectOption } from '@root/helpers';
import {
  useBusinessContext,
  useCrudPermissions,
  useIsRecyclingFacilityBU,
  useStores,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerGroupType, IPurchaseOrder } from '@root/types';

import { INewCustomerData } from '../../types';

import styles from '../../css/styles.scss';
import AdditionalPreferences from './AdditionalPreferences';
import GeneralInformationName from './Name';

// TODO: remove it after TextInput refactoring

const MAX_PHONE_NUMBERS_COUNT = 5;
const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.Text.';

const GeneralInformationTab: React.FC<{ commercial: boolean }> = ({ commercial }) => {
  const { customerGroupStore, brokerStore, userStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();

  const customerGroups = customerGroupStore.values;
  const brokers = brokerStore.sortedValues;
  const users = userStore.sortedValues;

  const [canViewBrokers] = useCrudPermissions('configuration', 'brokers');

  useEffect(() => {
    userStore.cleanup();

    if (canViewBrokers) {
      brokerStore.request();
    }

    userStore.requestSalesRepsByBU(+businessUnitId);
  }, [canViewBrokers, brokerStore, businessUnitId, userStore]);

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const customerGroupOptions: ISelectOption[] = customerGroups
    .filter(customerGroup => customerGroup.active)
    .filter(customerGroup =>
      isRecyclingFacilityBU
        ? customerGroup.type === CustomerGroupType.commercial
        : customerGroup.type !== CustomerGroupType.walkUp,
    )
    .map(customerGroup => ({
      label: customerGroup.description,
      value: customerGroup.id,
    }));

  const ownerOptions: ISelectOption[] = brokers
    .filter(x => x.active)
    .map(broker => ({
      label: broker?.name ?? '',
      value: broker.id,
    }));

  const salesOptions: ISelectOption[] = users.map(user => ({
    label: user.fullName,
    value: user.id,
  }));

  const { values, errors, handleChange, setErrors, setFieldValue, setFieldError } =
    useFormikContext<INewCustomerData>();

  const purchaseOrderOptions: ISelectOption[] = useMemo(
    () =>
      purchaseOrdersToSelectOption({
        formatDateTime,
        t,
        purchaseOrders: values.purchaseOrders ?? [],
      }),
    [values.purchaseOrders, formatDateTime, t],
  );

  const handleCustomerGroupChange = useCallback(
    (name: string, value: string) => {
      setFieldValue(name, value);
      setErrors({});
    },
    [setErrors, setFieldValue],
  );

  const handlePoRequiredChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e);
      setFieldError('defaultPurchaseOrders', undefined);
    },
    [handleChange, setFieldError],
  );

  const handleCreatePurchaseOrder = useCallback(
    (data: IPurchaseOrder) => {
      const purchaseOrder = {
        ...data,
        id: (values.purchaseOrders?.length ?? 0) + 1,
        businessUnitId,
        customerId: '',
        isOneTime: false,
      };

      setFieldValue('purchaseOrders', [...(values.purchaseOrders ?? []), purchaseOrder]);
    },
    [businessUnitId, values.purchaseOrders, setFieldValue],
  );

  return (
    <>
      <Layouts.Padding padding="5" top="3">
        <Layouts.Flex>
          <Layouts.Column>
            <Select
              label="Customer group*"
              key="customerGroupId"
              name="customerGroupId"
              options={customerGroupOptions}
              value={values.customerGroupId}
              error={errors.customerGroupId}
              onSelectChange={handleCustomerGroupChange}
            />
            <GeneralInformationName commercial={commercial} />
            <Select
              label={t(`${I18N_PATH}Broker`)}
              name="ownerId"
              key="ownerId"
              disabled={!canViewBrokers}
              options={ownerOptions}
              value={values.ownerId}
              error={errors.ownerId}
              onSelectChange={setFieldValue}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={values.email}
              error={errors.email}
              onChange={handleChange}
            />
          </Layouts.Column>
          <Layouts.Column>
            <Layouts.Flex as={Layouts.Box} minHeight="88px" justifyContent="space-between">
              {!isRecyclingFacilityBU ? (
                <Checkbox
                  id="signatureRequired"
                  name="signatureRequired"
                  value={values.signatureRequired}
                  error={errors.signatureRequired}
                  onChange={handleChange}
                >
                  Require signature
                </Checkbox>
              ) : null}
              <Checkbox
                id="poRequired"
                name="poRequired"
                value={values.poRequired}
                error={errors.poRequired}
                onChange={handlePoRequiredChange}
              >
                Require PO number
              </Checkbox>
            </Layouts.Flex>
            <PurchaseOrderSelect
              isMulti
              fullSizeModal
              label={`${t(`${I18N_PATH}PONumber`)}*`}
              placeholder={t('Text.Select')}
              name="defaultPurchaseOrders"
              options={purchaseOrderOptions}
              value={values.defaultPurchaseOrders ?? []}
              error={errors.defaultPurchaseOrders}
              onSelectChange={setFieldValue}
              onCreatePurchaseOrder={handleCreatePurchaseOrder}
            />
            <FormInput
              label="Alternate ID"
              name="alternateId"
              value={values.alternateId ?? ''}
              error={errors.alternateId}
              onChange={handleChange}
            />
            <Select
              label="Sales rep"
              name="salesId"
              key="salesId"
              options={salesOptions}
              value={values.salesId}
              error={errors.salesId}
              onSelectChange={setFieldValue}
            />
          </Layouts.Column>
        </Layouts.Flex>
      </Layouts.Padding>
      <Divider />
      <FieldArray name="phoneNumbers">
        {({ push, remove }) => {
          return (
            <>
              <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
                <Layouts.Padding padding="3" left="5" right="5">
                  {values.phoneNumbers.map((phoneNumber, index) => (
                    <PhoneNumber
                      index={index}
                      key={index}
                      phoneNumber={phoneNumber}
                      parentFieldName="phoneNumbers"
                      errors={getIn(errors, 'phoneNumbers')}
                      onRemove={remove}
                      errorsDuplicate={errors.phoneNumber}
                      onChange={handleChange}
                      onNumberChange={setFieldValue}
                      showTextOnly
                    />
                  ))}
                </Layouts.Padding>
              </Layouts.Box>
              <Divider />
              <Layouts.Box>
                <Layouts.Padding padding="5" top="3" bottom="3">
                  {values.phoneNumbers.length < MAX_PHONE_NUMBERS_COUNT ? (
                    <PhoneNumberAdd index={values.phoneNumbers.length} push={push} />
                  ) : null}
                </Layouts.Padding>
              </Layouts.Box>
            </>
          );
        }}
      </FieldArray>
      <Layouts.Padding padding="5" top="2" bottom="2">
        <FormInput
          label={t(`${I18N_PATH}GeneralNote`)}
          placeholder={t(`${I18N_PATH}PopupPlaceholder`)}
          name="generalNote"
          value={values.generalNote}
          error={errors.generalNote}
          onChange={handleChange}
          className={styles.textArea}
          area
        />
        <FormInput
          label={t(`${I18N_PATH}PopupNote`)}
          placeholder={t(`${I18N_PATH}PopupPlaceholder`)}
          name="popupNote"
          value={values.popupNote}
          error={errors.popupNote}
          onChange={handleChange}
          className={styles.textArea}
          area
        />
        <FormInput
          label={t(`${I18N_PATH}BillingPopUp`)}
          placeholder={t(`${I18N_PATH}PopupPlaceholder`)}
          name="billingNote"
          value={values.billingNote}
          error={errors.billingNote}
          onChange={handleChange}
          className={styles.textArea}
          area
        />
        <FormInput
          label={t(`${I18N_PATH}WorkOrderNote`)}
          placeholder={t(`${I18N_PATH}PopupPlaceholder`)}
          name="workOrderNote"
          value={values.workOrderNote}
          error={errors.workOrderNote}
          onChange={handleChange}
          className={styles.textArea}
          area
        />
        {isRecyclingFacilityBU ? <AdditionalPreferences /> : null}
      </Layouts.Padding>
    </>
  );
};

export default observer(GeneralInformationTab);
