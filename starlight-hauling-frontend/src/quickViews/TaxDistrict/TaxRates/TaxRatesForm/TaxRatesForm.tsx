import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, NavigationConfigItem } from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { partition } from 'lodash';

import { FormInput } from '@root/common';
import { TaxCalculation } from '@root/consts';
import { useIntl } from '@root/i18n/useIntl';

import { getTaxItemError } from '../formikData';
import { FormikTax, FormikTaxItem, TaxRatesConfigType } from '../types';

import styles from '../../css/taxRatesStyles.scss';
import Skeleton from './components/Skeleton/Skeleton';
import TaxSettings from './components/TaxSettings/TaxSettings';

export interface ITaxRatesForm {
  isRollOffType: boolean;
  currentTab: NavigationConfigItem<TaxRatesConfigType>;
  showGroupTaxes: boolean;
  loading: boolean;
}

const I18N_PATH =
  'pages.SystemConfiguration.tables.TaxDistricts.QuickView.TaxRates.TaxRatesForm.Text.';

const thresholdsToggler = 'thresholds-toggler';
const lineItemsToggler = 'line-items-toggler';

const shouldBeEnabled = (
  taxItem: FormikTaxItem,
  value: boolean,
  isThresholds: boolean,
  isLineItems: boolean,
): boolean => {
  if (isThresholds && taxItem.isThreshold) {
    return value;
  } else if (isLineItems && !taxItem.isThreshold) {
    return value;
  } else if (!isLineItems && !isThresholds) {
    return taxItem.enabled;
  }

  return taxItem.enabled;
};

const TaxRatesForm: React.FC<ITaxRatesForm> = ({ isRollOffType, currentTab, loading }) => {
  const { values, handleChange, setFieldValue, setFieldError, errors } =
    useFormikContext<FormikTax>();
  const { t } = useTranslation();
  const { currencySymbol } = useIntl();

  const handleItemToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = e.target.checked;
      const path = `items[${index}]`;

      setFieldValue(`${path}.enabled`, value);
      setFieldValue(`${path}.value`, '');

      if (!value) {
        setFieldError(path, undefined);
      }
    },
    [setFieldError, setFieldValue],
  );

  const disabledCount = values.items.filter(item => !item.enabled).length;

  const [thresholds, lineItems] = useMemo(
    () => (currentTab.key !== 'lineItems' ? [[], []] : partition(values.items, 'isThreshold')),
    [currentTab.key, values.items],
  );

  const disabledThresholds = thresholds.filter(item => !item.enabled).length;
  const disabledLineItems = lineItems.filter(item => !item.enabled).length;

  const handleToggleAllChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const taxItems = values.items;
      const isThresholds = event.target.name === thresholdsToggler;
      const isLineItems = event.target.name === lineItemsToggler;

      if (event.target.checked) {
        taxItems.forEach((taxItem, index) => {
          const enabled = shouldBeEnabled(taxItem, true, isThresholds, isLineItems);

          setFieldValue(`items[${index}]`, {
            ...taxItem,
            enabled,
          });

          if (!enabled) {
            setFieldError(`items[${index}]`, undefined);
          }
        });
      } else {
        taxItems.forEach((taxItem, index) => {
          const enabled = shouldBeEnabled(taxItem, false, isThresholds, isLineItems);

          setFieldValue(`items[${index}]`, {
            ...taxItem,
            enabled,
            value: enabled ? taxItem.value : '',
          });

          if (!enabled) {
            setFieldError(`items[${index}]`, undefined);
          }
        });
      }
    },
    [setFieldError, setFieldValue, values.items],
  );

  const renderTaxItems = (items: typeof values.items, offset = 0) =>
    items.map((taxItem, index) => {
      return (
        <div key={taxItem.id} className={styles.taxRow}>
          <Layouts.Box width="75%">
            <Checkbox
              name={`items[${index + offset}].enabled`}
              labelClass={styles.taxName}
              value={taxItem.enabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleItemToggle(e, index + offset)
              }
            >
              <div className={cx(styles.label, !taxItem.enabled && styles.disabled)}>
                {taxItem.description}
              </div>
            </Checkbox>
          </Layouts.Box>
          {values.group ? (
            <FormInput
              type="number"
              disabled={values.group || !taxItem.enabled}
              name={`items[${index + offset}].value`}
              ariaLabel={
                values.calculation === TaxCalculation.Flat
                  ? 'Group flat tax value'
                  : 'Group tax rate value'
              }
              value={taxItem.enabled ? values.value : ''}
              onChange={handleChange}
              className={styles.groupTaxInput}
              error={getTaxItemError(errors?.items, index + offset)}
            />
          ) : (
            <FormInput
              disabled={values.group || !taxItem.enabled}
              name={`items[${index + offset}].value`}
              ariaLabel={
                values.calculation === TaxCalculation.Flat ? 'Flat tax value' : 'Tax rate value'
              }
              value={taxItem.value}
              onChange={handleChange}
              className={styles.groupTaxInput}
              error={getTaxItemError(errors?.items, index + offset)}
              errorAlign="right"
            />
          )}
        </div>
      );
    });

  if (loading) {
    return (
      <>
        <TaxSettings currentTab={currentTab} isRollOffType={isRollOffType} />
        <Skeleton />
      </>
    );
  }
  const title =
    values.calculation === TaxCalculation.Flat
      ? t(`${I18N_PATH}FlatTax`, { currencySymbol })
      : t(`${I18N_PATH}TaxRate`);

  return (
    <>
      <TaxSettings currentTab={currentTab} isRollOffType={isRollOffType} />
      {currentTab.key !== 'lineItems' ? (
        <div className={styles.taxes}>
          <div className={styles.taxRow}>
            <Checkbox
              name={lineItemsToggler}
              onChange={handleToggleAllChange}
              value={disabledCount === 0}
              disabled={values.items.length === 0}
              indeterminate={disabledCount > 0 ? disabledCount < values.items.length : undefined}
            >
              <span className={cx(styles.label, styles.upperCase)}>{currentTab?.label}</span>
            </Checkbox>
            <span className={cx(styles.label, styles.upperCase)}>{title}</span>
          </div>
          {renderTaxItems(values.items)}
        </div>
      ) : (
        <>
          <div className={styles.taxes}>
            <div className={styles.taxRow}>
              <Checkbox
                name={thresholdsToggler}
                onChange={handleToggleAllChange}
                value={disabledThresholds === 0}
                disabled={thresholds.length === 0}
                indeterminate={
                  disabledThresholds > 0 ? disabledThresholds < thresholds.length : undefined
                }
              >
                <span className={cx(styles.label, styles.upperCase)}>Thresholds</span>
              </Checkbox>
              <span className={cx(styles.label, styles.upperCase)}>{title}</span>
            </div>
            {renderTaxItems(thresholds)}
          </div>
          <div className={styles.taxes}>
            <div className={styles.taxRow}>
              <Checkbox
                name={lineItemsToggler}
                onChange={handleToggleAllChange}
                value={disabledLineItems === 0}
                disabled={lineItems.length === 0}
                indeterminate={
                  disabledLineItems > 0 ? disabledLineItems < lineItems.length : undefined
                }
              >
                <span className={cx(styles.label, styles.upperCase)}>Line items</span>
              </Checkbox>
              <span className={cx(styles.label, styles.upperCase)}>{title}</span>
            </div>
            {renderTaxItems(lineItems, thresholds.length)}
          </div>
        </>
      )}
    </>
  );
};

export default TaxRatesForm;
