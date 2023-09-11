import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';

import { FormInput, Typography } from '@root/common';
import { BillingCycleEnum, billingCyclesOptions } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ILineItem } from '@root/types';

import styles from '../../css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.RecurringLineItemForm.',
);

export const RecurringLineItemQuickViewForm: React.FC = () => {
  const { t } = useTranslation();
  const { values, errors, setFieldValue, handleChange: onChange } = useFormikContext<ILineItem>();
  const { businessLineStore } = useStores();
  const { businessLineId } = useBusinessContext();

  const changeBillingCycle = useCallback(
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
      }
    },
    [values, setFieldValue],
  );

  const businessLineType = useMemo(
    () => businessLineStore.getById(businessLineId)?.type,
    [businessLineId, businessLineStore],
  );

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
          >
            {t('Text.Active')}
          </Checkbox>
        </td>
      </tr>
      <tr role="group" aria-labelledby="BillingCycles">
        <td id="BillingCycles" className={styles.frequencyListSpace}>
          {t(`${I18N_PATH.Text}BillingCycles`)}*
        </td>
        <td>
          <FieldArray name="billingCycle">
            {() =>
              billingCyclesOptions.map(cycle =>
                businessLineType ? (
                  <Checkbox
                    id={cycle.value.toString()}
                    key={cycle.value}
                    name="billingCycles"
                    value={values.billingCycles?.includes(cycle.value as BillingCycleEnum)}
                    onChange={e => changeBillingCycle(e, cycle)}
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
    </tbody>
  );
};
