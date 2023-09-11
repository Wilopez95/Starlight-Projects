import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IPromo } from '@root/types';

import { IPromosQuickViewData } from './types';

import styles from './css/styles.scss';

const PromosQuickViewRightPanel: React.FC<IPromosQuickViewData> = () => {
  const { promoStore, systemConfigurationStore } = useStores();

  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();
  const { dateFormat } = useDateIntl();

  const { values, errors, handleChange, setFieldValue } = useFormikContext<IPromo>();

  const selectedPromo = promoStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedPromo;
  const title = isNew ? 'Create New Promo' : values.description ?? selectedPromo?.description;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{title}</Typography>
        <Divider both />
        <div className={styles.formContainer}>
          <Table>
            <tbody>
              <tr>
                <td className={styles.space}>Status</td>
                <td>
                  <Checkbox
                    id="activeCheckbox"
                    name="active"
                    value={values.active}
                    labelClass={styles.activeCheckbox}
                    onChange={handleChange}
                  >
                    Active
                  </Checkbox>
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
                    Description
                  </Typography>
                </td>
                <td>
                  <FormInput
                    name="description"
                    onChange={handleChange}
                    value={values.description ?? ''}
                    error={errors.description}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="code" variant="bodyMedium" shade="light">
                    Code*
                  </Typography>
                </td>
                <td>
                  <FormInput
                    name="code"
                    onChange={handleChange}
                    value={values.code}
                    error={errors.code}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="startDate" variant="bodyMedium" shade="light">
                    Start Date
                  </Typography>
                </td>
                <td>
                  <Calendar
                    name="startDate"
                    withInput
                    onDateChange={setFieldValue}
                    value={values.startDate}
                    placeholder={t('Text.SetDate')}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    error={errors.startDate}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="endDate" variant="bodyMedium" shade="light">
                    End Date
                  </Typography>
                </td>
                <td>
                  <Calendar
                    name="endDate"
                    withInput
                    onDateChange={setFieldValue}
                    value={values.endDate}
                    placeholder={t('Text.SetDate')}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    error={errors.endDate as string}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="note" variant="bodyMedium" shade="light">
                    Note
                  </Typography>
                </td>
                <td>
                  <FormInput
                    name="note"
                    onChange={handleChange}
                    value={values.note ?? ''}
                    error={errors.note}
                    area
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(PromosQuickViewRightPanel);
