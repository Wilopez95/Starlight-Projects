import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';

import { FormInput, Typography } from '@root/common';
import {
  actionOptions,
  BillableItemActionEnum,
  CustomerOwnedEquipmentAllowedActions,
  recyclingActionOptions,
} from '@root/consts';
import { usePrevious, useSalesPointUsed, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IBillableService } from '@root/types';

import styles from '../../css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.BillableOneTimeServiceForm.',
);

export const BillableOneTimeServiceQuickViewForm: React.FC<IBillableServiceQuickViewForm> = ({
  equipmentItemOptions,
}) => {
  const {
    values,
    errors,
    handleChange: onChange,
    setFieldValue,
  } = useFormikContext<IBillableService>();
  const { equipmentItemStore } = useStores();
  const spUsed = useSalesPointUsed();

  const { t } = useTranslation();

  const isRecyclingService =
    values.action === BillableItemActionEnum.dump || values.action === BillableItemActionEnum.load;

  const handleActionSelect = useCallback(
    (_, action: string) => {
      if (!CustomerOwnedEquipmentAllowedActions.includes(action as BillableItemActionEnum)) {
        if (
          equipmentItemStore.values.find(
            equipment => equipment.id === values.equipmentItemId && equipment.customerOwned,
          )
        ) {
          setFieldValue('equipmentItemId', 0);
        }
      }

      setFieldValue('action', action);
    },
    [setFieldValue, equipmentItemStore.values, values.equipmentItemId],
  );

  const equipment = useMemo(
    () => equipmentItemOptions.find(option => option.value === values.equipmentItemId),
    [equipmentItemOptions, values.equipmentItemId],
  );

  const prevId = usePrevious(values.id);
  const prevActionValue = usePrevious(values.action);
  const prevEquipmentValue = usePrevious(equipment);

  useEffect(() => {
    if (values.id !== prevId) {
      return;
    }
    if (
      (!prevActionValue && !prevEquipmentValue) ||
      (prevActionValue === values.action && prevEquipmentValue?.value === equipment?.value)
    ) {
      return;
    }

    const actionOption = actionOptions
      .concat(recyclingActionOptions)
      .find(option =>
        typeof option === 'string' ? option === values.action : option.value === values.action,
      );

    const action = typeof actionOption === 'string' ? startCase(actionOption) : actionOption?.label;

    if (equipment?.label && action) {
      setFieldValue('description', `${equipment.label} ${action}`);
    }
  }, [
    equipment,
    prevActionValue,
    prevEquipmentValue,
    prevId,
    setFieldValue,
    values.action,
    values.id,
  ]);

  return (
    <tbody>
      <tr>
        <td className={styles.space}>{t('Text.Status')}</td>
        <td>
          <Checkbox
            id="activeCheckbox"
            labelClass={styles.activeCheckbox}
            name="active"
            value={values.active}
            onChange={onChange}
            disabled={isRecyclingService}
          >
            {t(`Text.Active`)}
          </Checkbox>
        </td>
      </tr>
      {!isRecyclingService ? (
        <tr>
          <td className={styles.space}>
            <Typography as="label" htmlFor="equipmentItemId" variant="bodyMedium" shade="light">
              {t('Text.Equipment')}*
            </Typography>
          </td>
          <td>
            <Select
              placeholder={t(`${I18N_PATH.Form}SelectEquipment`)}
              key="equipmentItemId"
              name="equipmentItemId"
              value={values.equipmentItemId}
              options={equipmentItemOptions}
              onSelectChange={setFieldValue}
              error={errors.equipmentItemId}
            />
          </td>
        </tr>
      ) : null}
      <tr>
        <td className={styles.space}>
          <Typography as="label" htmlFor="action" variant="bodyMedium" shade="light">
            {t('Text.Action')}*
          </Typography>
        </td>
        <td>
          <Select
            placeholder={t(`${I18N_PATH.Form}SelectAction`)}
            key="action"
            name="action"
            value={values.action}
            options={isRecyclingService ? recyclingActionOptions : actionOptions}
            disabled={isRecyclingService}
            onSelectChange={handleActionSelect}
            error={errors.action}
          />
        </td>
      </tr>
      <tr>
        <td className={styles.frequencyListSpace}>
          <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
            {t('Text.Description')}*
          </Typography>
        </td>
        <td>
          <FormInput
            name="description"
            onChange={onChange}
            value={values.description}
            error={errors.description}
            area
          />
        </td>
      </tr>
      {!isRecyclingService ? (
        <tr>
          <td className={styles.space}>{t(`${I18N_PATH.Text}Surcharge`)}</td>
          <td>
            <Checkbox
              id="applySurcharges"
              labelClass={styles.activeCheckbox}
              name="applySurcharges"
              value={values.applySurcharges}
              onChange={onChange}
            >
              {t(`${I18N_PATH.Text}ApplySurcharges`)}
            </Checkbox>
          </td>
        </tr>
      ) : null}
      {!isRecyclingService ? (
        <tr>
          <td className={styles.space}>
            <Typography as="label" htmlFor="importCodes" variant="bodyMedium" shade="light">
              {t('Text.ImportCodes')}
            </Typography>
          </td>
          <td>
            <FormInput
              name="importCodes"
              onChange={onChange}
              value={values.importCodes ?? ''}
              error={errors.importCodes}
            />
          </td>
        </tr>
      ) : null}
      <tr>
        <td colSpan={2}>
          <Checkbox
            id="materialBasedPricing"
            name="materialBasedPricing"
            value={values.materialBasedPricing}
            onChange={onChange}
            labelClass={styles.checkbox}
          >
            {t(`${I18N_PATH.Text}PricingBasedOnMaterial`)}
          </Checkbox>
        </td>
      </tr>
      {!isRecyclingService ? (
        <tr>
          <td colSpan={2}>
            <Checkbox
              id="allowForRecurringOrders"
              name="allowForRecurringOrders"
              value={values.allowForRecurringOrders}
              onChange={onChange}
              labelClass={styles.checkbox}
            >
              {t(`${I18N_PATH.Text}AllowForRecurringOrders`)}
            </Checkbox>
          </td>
        </tr>
      ) : null}
      {spUsed ? (
        <tr>
          <td colSpan={2}>
            <Checkbox
              id="spUsed"
              name="spUsed"
              value={values?.spUsed}
              labelClass={styles.checkbox}
              onChange={onChange}
            >
              {t(`${I18N_PATH.Form}UseWithSalesPoint`)}
            </Checkbox>
          </td>
        </tr>
      ) : null}
    </tbody>
  );
};

interface IBillableServiceQuickViewForm {
  equipmentItemOptions: ISelectOption[];
}
