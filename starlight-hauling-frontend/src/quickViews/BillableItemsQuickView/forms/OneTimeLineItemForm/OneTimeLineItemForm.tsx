import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { xor } from 'lodash-es';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import {
  lineItemOptions,
  metricUnitOptions,
  recyclingLineItemOptions,
  recyclingMetricUnitOptions,
  recyclingUnitOptions,
  unitOptions,
} from '@root/consts';
import { normalizeOptions } from '@root/helpers';
import { useBusinessContext, useStores, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { buildI18Path } from '@root/i18n/helpers';
import { BillableLineItemType, ILineItem } from '@root/types';

import styles from '../../css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.OneTimeLineItemQuickViewForm.',
);

export const OneTimeLineItemQuickViewForm: React.FC<IOneTimeLineItemQuickViewForm> = ({
  isTripCharge,
}) => {
  const { t } = useTranslation();
  const { businessLineStore, materialStore } = useStores();

  const { businessLineId } = useBusinessContext();

  const {
    errors,
    values,
    setFieldError,
    setFieldValue,
    handleChange: onChange,
  } = useFormikContext<ILineItem>();
  const { currentUser } = useUserContext();

  const handleLineItemTypeChange = useCallback(
    (name: string, value: BillableLineItemType) => {
      setFieldValue(name, value);
      setFieldValue('materialIds', []);
      if (value === 'miscellaneousItem') {
        setFieldValue('unit', 'each');
      }
    },
    [setFieldValue],
  );

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);
  const isMetric = currentUser?.company?.unit === Units.metric;

  const isMiscItem = values.type === 'miscellaneousItem';

  const materials = materialStore.sortedValues.filter(material => material.misc);

  const typeOptions = useMemo(() => {
    if (!isRecyclingLoB) {
      return isTripCharge ? lineItemOptions : lineItemOptions.filter(item => item !== 'tripCharge');
    }

    return recyclingLineItemOptions;
  }, [isRecyclingLoB, isTripCharge]);

  const lineItemUnitOptions = useMemo(() => {
    if (isRecyclingLoB) {
      return isMetric ? recyclingMetricUnitOptions : recyclingUnitOptions;
    } else {
      return isMetric ? metricUnitOptions : unitOptions;
    }
  }, [isMetric, isRecyclingLoB]);

  return (
    <tbody>
      <tr>
        <td className={styles.space}>{t('Text.Status')}</td>
        <td>
          <Checkbox
            id="activeCheckbox"
            labelClass={styles.activeCheckbox}
            name="active"
            disabled={isTripCharge}
            value={values.active}
            onChange={onChange}
          >
            {t(`Text.Active`)}
          </Checkbox>
        </td>
      </tr>
      <tr>
        <td className={styles.space}>
          <Typography as="label" htmlFor="type" variant="bodyMedium" shade="light">
            {t(`${I18N_PATH.Text}LineItemType`)}*
          </Typography>
        </td>
        <td>
          <Select
            placeholder={t(`${I18N_PATH.Form}SelectLineItemType`)}
            key="type"
            name="type"
            disabled={isTripCharge || !!(values.id && isRecyclingLoB)}
            value={values.type}
            options={normalizeOptions(typeOptions)}
            onSelectChange={handleLineItemTypeChange}
            error={errors.type}
            nonClearable
          />
        </td>
      </tr>
      <tr>
        <td className={styles.space}>
          <Typography as="label" htmlFor="unit" variant="bodyMedium" shade="light">
            {t('Text.Units')}*
          </Typography>
        </td>
        <td>
          <Select
            name="unit"
            value={values.unit}
            options={lineItemUnitOptions}
            onSelectChange={setFieldValue}
            error={errors.unit}
            disabled={isTripCharge || isMiscItem}
            nonClearable
          />
        </td>
      </tr>
      <tr>
        <td className={styles.space}>
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
      {!isRecyclingLoB ? (
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
      <tr>
        <td className={styles.space} />
        <td>
          <Checkbox
            id="materialBasedPricing"
            name="materialBasedPricing"
            value={values.materialBasedPricing}
            onChange={onChange}
          >
            {t(`${I18N_PATH.Text}MaterialBasedPricing`)}
          </Checkbox>
        </td>
      </tr>
      {isRecyclingLoB && isMiscItem ? (
        <>
          <Divider both colSpan={3} />
          {materials.map(material => (
            <tr key={material.id}>
              <td colSpan={3}>
                <Layouts.Padding bottom="1">
                  <Checkbox
                    id={`materials[${material.id}]`}
                    value={values.materialIds?.includes(material.id)}
                    onChange={() => {
                      setFieldValue('materialIds', xor(values.materialIds, [material.id]));
                      setFieldError('materialIds', undefined);
                    }}
                    name={material.id.toString()}
                  >
                    {material.description}
                  </Checkbox>
                </Layouts.Padding>
              </td>
            </tr>
          ))}
        </>
      ) : null}
      <tr>
        {errors.materialIds ? (
          <td colSpan={3}>
            <Typography color="alert" variant="bodyMedium">
              {errors.materialIds}
            </Typography>
          </td>
        ) : null}
      </tr>
    </tbody>
  );
};

interface IOneTimeLineItemQuickViewForm {
  isTripCharge: boolean;
}
