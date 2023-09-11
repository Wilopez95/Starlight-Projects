import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, ISelectOption, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';

import { FormInput, Typography } from '@root/common';
import { normalizeOptions } from '@root/helpers';
import { useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { buildI18Path } from '@root/i18n/helpers';
import { IThreshold } from '@root/types';

import styles from '../../css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.ThresholdForm.',
);

const thresholdTypes: ISelectOption[] = normalizeOptions([
  'overweight',
  'usageDays',
  'demurrage',
  'dump',
  'load',
]);

export const ThresholdQuickViewForm: React.FC = () => {
  const { t } = useTranslation();
  const { values, errors, handleChange: onChange } = useFormikContext<IThreshold>();

  const { currentUser } = useUserContext();

  const tonLabel = currentUser?.company?.unit === Units.metric ? 'tonne' : 'ton';
  const thresholdUnits: ISelectOption[] = normalizeOptions(['day', tonLabel, 'min']);

  const isRecyclingThreshold = values.type === 'dump' || values.type === 'load';

  return (
    <tbody>
      <tr>
        <td className={styles.space}>
          <Typography as="label" htmlFor="thresholdType" variant="bodyMedium" shade="light">
            {t(`${I18N_PATH.Text}ThresholdType`)}
          </Typography>
        </td>
        <td>
          <Select
            id="thresholdType"
            disabled
            name="type"
            options={thresholdTypes}
            value={values.type}
            onSelectChange={noop}
          />
        </td>
      </tr>
      <tr>
        <td className={styles.space}>
          <Typography as="label" htmlFor="thresholdUnit" variant="bodyMedium" shade="light">
            {t(`${I18N_PATH.Text}ThresholdUnit`)}
          </Typography>
        </td>
        <td>
          <Select
            id="thresholdUnit"
            disabled
            name="unit"
            options={thresholdUnits}
            value={values.unit}
            onSelectChange={noop}
          />
        </td>
      </tr>
      <tr>
        <td className={styles.space}>
          <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
            {t(`Text.Description`)}*
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
      {!isRecyclingThreshold ? (
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
    </tbody>
  );
};
