import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { DescriptiveTooltip, FormInput, RadioButton } from '@root/common';
import { SurchargeCalculation } from '@root/consts';
import { ISurcharge } from '@root/types/entities/surcharge';

import styles from '../../css/styles.scss';

const I18N_PATH =
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.SurchargeForm.Text.';

export const SurchargeQuickViewForm: React.FC = () => {
  const { t } = useTranslation();
  const { errors, values, handleChange: onChange, setFieldValue } = useFormikContext<ISurcharge>();

  const handleCanlculationChange = useCallback(
    (value: string) => {
      setFieldValue('calculation', value);
    },
    [setFieldValue],
  );

  return (
    <tbody>
      <tr>
        <td className={styles.space}>{t('Status')}</td>
        <td>
          <Checkbox
            id="activeCheckbox"
            labelClass={styles.activeCheckbox}
            name="active"
            value={values.active}
            onChange={onChange}
          >
            {t(`Active`)}
          </Checkbox>
        </td>
      </tr>
      <tr>
        <td className={styles.space}>
          <label htmlFor="description">{t('Text.Description')}*</label>
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
      <tr role="radiogroup" aria-labelledby="calculation">
        <td id="calculation" className={styles.space}>
          {t(`${I18N_PATH}Type`)}
        </td>
        <td>
          <Layouts.Margin bottom="1">
            <RadioButton
              name="calculation"
              onChange={() => handleCanlculationChange(SurchargeCalculation.Percentage)}
              value={values.calculation === SurchargeCalculation.Percentage}
            >
              <span className={styles.label}>{t(`${I18N_PATH}Percentage`)}</span>
              <span>
                <DescriptiveTooltip
                  position="top"
                  inline
                  text={t(`${I18N_PATH}PercentageSurcharges`)}
                />
              </span>
            </RadioButton>
          </Layouts.Margin>
          <Layouts.Margin bottom="2">
            <RadioButton
              name="calculation"
              onChange={() => handleCanlculationChange(SurchargeCalculation.Flat)}
              value={values.calculation === SurchargeCalculation.Flat}
            >
              <span className={styles.label}>{t(`${I18N_PATH}Flat`)}</span>
              <span>
                <DescriptiveTooltip position="top" inline text={t(`${I18N_PATH}FlatSurcharges`)} />
              </span>
            </RadioButton>
          </Layouts.Margin>
        </td>
      </tr>
      <tr>
        <td className={styles.space} />
        <td>
          <Checkbox
            id="materialBasedPricing"
            name="materialBasedPricing"
            value={values.materialBasedPricing}
            onChange={onChange}
          >
            {t(`${I18N_PATH}MaterialBasedPricing`)}
          </Checkbox>
        </td>
      </tr>
    </tbody>
  );
};
