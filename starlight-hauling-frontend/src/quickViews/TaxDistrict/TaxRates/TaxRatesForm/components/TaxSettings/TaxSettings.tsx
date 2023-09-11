import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, NavigationConfigItem } from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';

import { FormInput, RadioButton } from '@root/common';
import { TaxApplication, TaxCalculation } from '@root/consts';
import { useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { FlatTax } from '@root/types';

import { FormikTax, TaxRatesConfigType } from '../../../types';

import styles from '../../../../css/taxRatesStyles.scss';

export interface ITaxSettings {
  currentTab: NavigationConfigItem<TaxRatesConfigType>;
  isRollOffType: boolean;
}

const TAX_APPLICATION_PER_ORDER = { value: TaxApplication.Order, label: 'Per Order' };
const GROUP_TAX_DISABLED_LIST = ['lineItems', 'recurringLineItems'];
const TAX_APPLICATION_RESTRICTIONS = [TaxApplication.Order, TaxApplication.Subscription];

const TaxSettings: React.FC<ITaxSettings> = ({ currentTab, isRollOffType }) => {
  const { values, handleChange, setFieldValue, setValues, setErrors, errors } =
    useFormikContext<FormikTax>();

  const flatTaxValues = values as FlatTax;
  const { currentUser } = useUserContext();
  const { t } = useTranslation();

  const handleGroupChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked;

      if (!value) {
        setValues({
          ...values,
          items: values.items.map(item => ({ ...item, value: values.value, enabled: true })),
          value: '',
        });
      }

      setErrors({});
      handleChange(e);
    },
    [handleChange, setErrors, setValues, values],
  );

  const handleTaxApplicationChange = useCallback(
    (value: TaxApplication) => {
      if (values.calculation === TaxCalculation.Flat) {
        setFieldValue('application', value);
      }
    },
    [setFieldValue, values.calculation],
  );

  const taxApplicationOptions = useMemo(() => {
    switch (currentTab.key) {
      case 'services':
      case 'materials':
        if (isRollOffType) {
          return [
            TAX_APPLICATION_PER_ORDER,
            {
              value: TaxApplication.Ton,
              label: currentUser?.company?.unit === Units.metric ? t('Text.Tonne') : t('Text.Tons'),
            },
          ];
        }

        return [TAX_APPLICATION_PER_ORDER];

      case 'recurringServices':
        return [{ value: TaxApplication.Subscription, label: 'Per Subscription' }];

      case 'lineItems':
        return [
          TAX_APPLICATION_PER_ORDER,
          { value: TaxApplication.Each, label: 'Per Item' },
          { value: TaxApplication.Quantity, label: 'Per Quantity' },
        ];

      case 'recurringLineItems':
        return [
          { value: TaxApplication.Subscription, label: 'Per Subscription' },
          { value: TaxApplication.Each, label: 'Per Item' },
        ];
      default:
        return null;
    }
  }, [currentTab.key, currentUser?.company?.unit, isRollOffType, t]);

  const handleTaxCalculationChange = useCallback(
    (value: TaxCalculation) => {
      setFieldValue('calculation', value);

      let application;

      if (value === TaxCalculation.Flat) {
        application = taxApplicationOptions?.[0].value;

        if (GROUP_TAX_DISABLED_LIST.includes(currentTab.key) && !values.group) {
          application = TaxApplication.Each;
        }
      }

      setFieldValue('application', application);
    },
    [currentTab.key, setFieldValue, taxApplicationOptions, values.group],
  );

  const groupLabel =
    values.calculation === TaxCalculation.Flat ? 'Group Flat Tax, $' : 'Group Tax Rate, %';

  const isGroupTaxDisabled =
    GROUP_TAX_DISABLED_LIST.includes(currentTab.key) &&
    TAX_APPLICATION_RESTRICTIONS.includes(values.application as TaxApplication);

  return (
    <div className={styles.settings}>
      <div role="radiogroup" aria-labelledby="calculation">
        <span id="calculation" className={cx(styles.label, styles.settingItem)}>
          Tax type
        </span>
        <div className={styles.settingItem}>
          <RadioButton
            name="calculation"
            onChange={() => handleTaxCalculationChange(TaxCalculation.Percentage)}
            value={values.calculation === TaxCalculation.Percentage}
          >
            <span className={styles.label}>Percentage</span>
          </RadioButton>
        </div>
        <div className={styles.settingItem}>
          <RadioButton
            name="calculation"
            onChange={() => handleTaxCalculationChange(TaxCalculation.Flat)}
            value={values.calculation === TaxCalculation.Flat}
          >
            <span className={styles.label}>Flat</span>
          </RadioButton>
        </div>
      </div>
      {taxApplicationOptions && taxApplicationOptions.length > 1 ? (
        <div role="radiogroup" aria-labelledby="application">
          <span
            id="application"
            className={cx(
              styles.label,
              styles.settingItem,
              values.calculation === TaxCalculation.Percentage && styles.disabled,
            )}
          >
            Apply
          </span>
          {taxApplicationOptions?.map(({ value, label }) => {
            const { calculation, group } = values;
            const isOptionDisabled =
              GROUP_TAX_DISABLED_LIST.includes(currentTab.key) &&
              !group &&
              TAX_APPLICATION_RESTRICTIONS.includes(value);

            return (
              <div key={value} className={styles.settingItem}>
                <RadioButton
                  name="application"
                  disabled={isOptionDisabled}
                  value={flatTaxValues.application === value}
                  onChange={() => handleTaxApplicationChange(value)}
                >
                  <span
                    className={cx(
                      styles.label,
                      calculation === TaxCalculation.Percentage && styles.disabled,
                    )}
                  >
                    {label}
                  </span>
                </RadioButton>
              </div>
            );
          })}
        </div>
      ) : null}
      <div>
        <Checkbox
          name="group"
          labelClass={styles.settingItem}
          value={values.group}
          onChange={handleGroupChange}
          disabled={isGroupTaxDisabled}
        >
          <span className={styles.label}>{groupLabel}</span>
        </Checkbox>
        <FormInput
          name="value"
          ariaLabel={
            values.calculation === TaxCalculation.Percentage ? 'Group tax rate' : 'Group flat tax'
          }
          value={values.value}
          onChange={handleChange}
          disabled={!values.group}
          className={styles.groupTaxInput}
          error={errors.value}
        />
      </div>
    </div>
  );
};

export default TaxSettings;
