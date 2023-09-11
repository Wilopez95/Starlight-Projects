import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';
import { intersection, noop, startCase } from 'lodash-es';

import { EditIcon } from '@root/assets';
import { FormInput, RadioButton, Typography } from '@root/common';
import { SetFrequenciesModal } from '@root/components/modals';
import {
  BillableItemActionEnum,
  BillingCycleEnum,
  billingCyclesOptions,
  CustomerOwnedEquipmentAllowedActions,
  frequencyConstraintsByCycles,
  ProrationTypeEnum,
  recurringActionOptions,
} from '@root/consts';
import { getBillableServiceIncludedServiceIds, handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useBusinessContext, usePrevious, useStores, useToggle } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IBillableService, IFrequency } from '@root/types';

import { Frequency } from '../../../../pages/SystemConfiguration/components/Frequency/Frequency';

import styles from '../../css/styles.scss';
import { SetIncludedServicesModal } from './components/SetIncludedServicesModal/SetIncludedServicesModal';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.BillableRecurringServiceForm.',
);

export const BillableRecurringServiceQuickViewForm: React.FC<IBillableServiceQuickViewForm> = ({
  equipmentItemOptions,
}) => {
  const { t } = useTranslation();
  const {
    values,
    errors,
    handleChange: onChange,
    setFieldValue,
  } = useFormikContext<IBillableService>();
  const { billableServiceStore, businessLineStore, equipmentItemStore } = useStores();

  const [isFrequencyModalOpen, toggleFrequencyModalOpen] = useToggle();
  const [isServicesModalOpen, toggleServicesModalOpen, setServicesModalOpen] = useToggle(false);

  const closeServicesModal = useCallback(() => setServicesModalOpen(false), [setServicesModalOpen]);

  const { businessLineId } = useBusinessContext();

  const handleFrequenciesSubmit = useCallback(
    (frequencies: IFrequency[]) => {
      setFieldValue('frequencies', frequencies);
    },
    [setFieldValue],
  );

  const handleServicesSave = useCallback(
    (services: number[]) => {
      setFieldValue('services', services);
    },
    [setFieldValue],
  );

  const handleActionSelect = useCallback(
    (_, action: string) => {
      if (action === BillableItemActionEnum.service) {
        setFieldValue('services', undefined);
      }

      if (action === BillableItemActionEnum.rental) {
        setFieldValue('frequencies', undefined);
      }

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

  const handleEquipmentSelect = useCallback(
    (_, equipmentId: number) => {
      setFieldValue('equipmentItemId', equipmentId);
      setFieldValue('services', null);
    },
    [setFieldValue],
  );

  const handleBillingCyclesChange = useCallback(
    (e, cycle) => {
      let updatedBillingCycles: BillingCycleEnum[] | undefined;

      if (e.target.checked) {
        updatedBillingCycles = [...(values.billingCycles ?? []), cycle.value];
      } else {
        updatedBillingCycles = values.billingCycles?.filter(
          billingCycle => billingCycle !== cycle.value,
        );
      }

      setFieldValue('billingCycles', updatedBillingCycles);

      if (!updatedBillingCycles?.length) {
        return;
      }

      const filteredFrequencies = values.frequencies?.filter(frequency => {
        const cyclesByFrequencies = frequencyConstraintsByCycles[frequency.type];

        return intersection(cyclesByFrequencies, updatedBillingCycles).length;
      });

      setFieldValue('frequencies', filteredFrequencies);
    },
    [values.billingCycles, values.frequencies, setFieldValue],
  );

  const shouldDisableServices = useMemo(() => !values.equipmentItemId, [values.equipmentItemId]);

  const shouldDisableFrequencies = useMemo(
    () =>
      !values.action ||
      values.action === BillableItemActionEnum.rental ||
      !values.billingCycles?.length,
    [values.action, values.billingCycles],
  );

  const businessLineType = useMemo(
    () => businessLineStore.getById(businessLineId)?.type,
    [businessLineId, businessLineStore],
  );

  const showOnlyUsageDaysOption = values.action === BillableItemActionEnum.rental;
  const showOnlyServicesPerformedOption =
    values.action === BillableItemActionEnum.service &&
    values.frequencies?.length === 1 &&
    values.frequencies[0].type === 'onCall';

  const equipment = useMemo(
    () => equipmentItemOptions.find(option => option.value === values.equipmentItemId),
    [equipmentItemOptions, values.equipmentItemId],
  );

  const prevActionValue = usePrevious(values.action);
  const prevEquipmentValue = usePrevious(equipment);

  useEffect(() => {
    if (
      (!prevActionValue && !prevEquipmentValue) ||
      (prevActionValue === values.action && prevEquipmentValue === equipment)
    ) {
      return;
    }
    const actionOption = recurringActionOptions.find(option =>
      typeof option === 'object' ? option.value === values.action : option === values.action,
    );

    const action = typeof actionOption === 'object' ? actionOption?.label : startCase(actionOption);

    if (equipment?.label && action) {
      setFieldValue('description', `${equipment.label} ${action}`);
    }
  }, [equipment, prevActionValue, prevEquipmentValue, setFieldValue, values.action]);

  useEffect(() => {
    if (showOnlyUsageDaysOption) {
      setFieldValue('prorationType', ProrationTypeEnum.usageDays);
    }
  }, [showOnlyUsageDaysOption, setFieldValue]);

  useEffect(() => {
    if (showOnlyServicesPerformedOption) {
      setFieldValue('prorationType', ProrationTypeEnum.servicesPerformed);
    }
  }, [showOnlyServicesPerformedOption, setFieldValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  return (
    <>
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
            >
              {t('Text.Active')}
            </Checkbox>
          </td>
        </tr>
        <tr>
          <td className={styles.space}>
            <Typography as="label" htmlFor="equipmentItemId" variant="bodyMedium" shade="light">
              {t(`${I18N_PATH.Text}Equipment`)}*
            </Typography>
          </td>
          <td>
            <Select
              placeholder={t(`${I18N_PATH.Form}SelectEquipment`)}
              key="equipmentItemId"
              name="equipmentItemId"
              value={values.equipmentItemId}
              options={equipmentItemOptions}
              onSelectChange={handleEquipmentSelect}
              error={errors.equipmentItemId}
            />
          </td>
        </tr>
        <tr role="group" aria-labelledby="BillingCycles">
          <td id="BillingCycles" className={styles.frequencyListSpace}>
            {t(`${I18N_PATH.Text}BillingCycles`)}
          </td>
          <td>
            <FieldArray name="billingCycles">
              {() =>
                billingCyclesOptions.map(cycle =>
                  businessLineType ? (
                    <Checkbox
                      id={cycle.value.toString()}
                      key={cycle.value}
                      name="billingCycles"
                      value={values.billingCycles?.includes(cycle.value as BillingCycleEnum)}
                      onChange={e => handleBillingCyclesChange(e, cycle)}
                    >
                      {t(`Text.${cycle.label}`) || cycle}
                    </Checkbox>
                  ) : null,
                )
              }
            </FieldArray>
            <Typography
              color="alert"
              variant="bodySmall"
              className={styles.validationText}
              data-error={errors.billingCycles}
            >
              {errors.billingCycles}
            </Typography>
          </td>
        </tr>
        <tr>
          <td className={styles.space}>
            <Typography as="label" htmlFor="action" variant="bodyMedium" shade="light">
              {t('Text.Action')}*
            </Typography>
          </td>
          <td>
            <Select
              placeholder="Select Action"
              key="action"
              name="action"
              value={values.action}
              options={recurringActionOptions}
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
        <tr>
          <td className={styles.frequencyListSpace}>
            <Typography variant="bodyMedium" color="default" shade="light">
              {t('Text.Includes')}
            </Typography>
          </td>
          <td>
            <Layouts.Margin left="0.5" right="1" bottom="1">
              <Layouts.Padding left="1">
                {getBillableServiceIncludedServiceIds(values)?.map((serviceId, index) => (
                  <Layouts.Padding bottom="1" key={index}>
                    <Layouts.Flex direction="row" justifyContent="space-between">
                      <Typography variant="bodyMedium" color="secondary" shade="light">
                        {billableServiceStore.getById(serviceId)?.description}
                      </Typography>
                    </Layouts.Flex>
                  </Layouts.Padding>
                ))}
                <Typography
                  variant="bodyMedium"
                  color={shouldDisableServices ? 'grey' : 'information'}
                  cursor={shouldDisableServices ? 'auto' : 'pointer'}
                  onClick={shouldDisableServices ? noop : toggleServicesModalOpen}
                >
                  <Layouts.Flex alignItems="center">
                    <Layouts.IconLayout>
                      <EditIcon
                        role="button"
                        aria-label={t(`${I18N_PATH.Text}SelectServices`)}
                        tabIndex={shouldDisableServices ? -1 : 0}
                        onKeyDown={e => handleKeyDown(e, toggleServicesModalOpen)}
                      />
                    </Layouts.IconLayout>
                    {t(`${I18N_PATH.Text}SelectServices`)}
                  </Layouts.Flex>
                </Typography>
                <Typography
                  color="alert"
                  variant="bodySmall"
                  className={styles.validationText}
                  data-error={errors.services}
                >
                  {errors.services}
                </Typography>
              </Layouts.Padding>
            </Layouts.Margin>
          </td>
        </tr>
        <tr>
          <td className={styles.frequencyListSpace}>
            <Typography variant="bodyMedium" color="default" shade="light">
              {t(`${I18N_PATH.Text}Frequency`)}
            </Typography>
          </td>
          <td>
            <Layouts.Margin left="0.5" right="1" bottom="1">
              <Layouts.Padding left="1">
                {values.frequencies?.map((frequency, index) => (
                  <Layouts.Padding bottom="1" key={index}>
                    <Frequency key={index} type={frequency.type} times={frequency.times} />
                  </Layouts.Padding>
                ))}

                <Typography
                  variant="bodyMedium"
                  color={shouldDisableFrequencies ? 'grey' : 'information'}
                  cursor={shouldDisableFrequencies ? 'auto' : 'pointer'}
                  onClick={shouldDisableFrequencies ? noop : toggleFrequencyModalOpen}
                >
                  <Layouts.Flex alignItems="center">
                    <Layouts.IconLayout>
                      <EditIcon
                        role="button"
                        aria-label={t(`${I18N_PATH.Text}EditFrequencies`)}
                        tabIndex={shouldDisableFrequencies ? -1 : 0}
                        onKeyDown={e => handleKeyDown(e, toggleFrequencyModalOpen)}
                      />
                    </Layouts.IconLayout>
                    {t(`${I18N_PATH.Text}EditFrequencies`)}
                  </Layouts.Flex>
                </Typography>
                <Typography
                  color="alert"
                  variant="bodySmall"
                  className={styles.validationText}
                  data-error={errors.frequencies}
                >
                  {errors.frequencies}
                </Typography>
              </Layouts.Padding>
            </Layouts.Margin>
          </td>
        </tr>
        <tr role="radiogroup" aria-labelledby="prorationType">
          <td className={styles.frequencyListSpace}>
            <Typography id="prorationType" variant="bodyMedium" color="default" shade="light">
              {t(`${I18N_PATH.Text}Proration`)}
            </Typography>
          </td>
          <td>
            <Layouts.Margin left="0.5" right="1" bottom="1">
              <Layouts.Padding left="1">
                {!showOnlyUsageDaysOption ? (
                  <Layouts.Margin bottom="3">
                    <RadioButton
                      name="prorationType"
                      value={values.prorationType === ProrationTypeEnum.servicesPerformed}
                      onChange={() =>
                        setFieldValue('prorationType', ProrationTypeEnum.servicesPerformed)
                      }
                    >
                      {t(`${I18N_PATH.Text}CalculateNumberServicesPerformed`)}
                    </RadioButton>
                  </Layouts.Margin>
                ) : null}
                {!showOnlyServicesPerformedOption ? (
                  <Layouts.Margin bottom="3">
                    <RadioButton
                      name="prorationType"
                      value={values.prorationType === ProrationTypeEnum.usageDays}
                      onChange={() => {
                        setFieldValue('prorationType', ProrationTypeEnum.usageDays);
                      }}
                    >
                      {t(`${I18N_PATH.Text}CalculateNumberUsageDays`)}
                    </RadioButton>
                  </Layouts.Margin>
                ) : null}
              </Layouts.Padding>
            </Layouts.Margin>
          </td>
        </tr>
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
        <tr>
          <td className={styles.space}>
            <Typography as="label" htmlFor="importCodes" variant="bodyMedium" shade="light">
              {t(`${I18N_PATH.Text}ImportCodes`)}
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
        <tr>
          <td colSpan={2}>
            <Checkbox
              id="materialBasedPricing"
              name="materialBasedPricing"
              value={values.materialBasedPricing}
              onChange={onChange}
              labelClass={styles.checkbox}
            >
              {t(`${I18N_PATH.Text}PricingBasedMaterial`)}
            </Checkbox>
          </td>
        </tr>
      </tbody>
      <SetIncludedServicesModal
        isOpen={isServicesModalOpen}
        onSave={handleServicesSave}
        onClose={closeServicesModal}
        billableItemAction={values.action}
        services={getBillableServiceIncludedServiceIds(values)}
        equipmentItemId={values.equipmentItemId}
      />
      <SetFrequenciesModal
        isOpen={isFrequencyModalOpen}
        onFormSubmit={handleFrequenciesSubmit}
        onClose={toggleFrequencyModalOpen}
        frequencies={values.frequencies ?? []}
        billingCycles={values.billingCycles ?? []}
      />
    </>
  );
};

interface IBillableServiceQuickViewForm {
  equipmentItemOptions: ISelectOption[];
}
