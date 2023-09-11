import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { startOfTomorrow } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IPermit } from '@root/types/entities/permit';

import { IPromosQuickViewData } from './types';

import styles from './css/styles.scss';

const tomorrow = startOfTomorrow();

const PermitsQuickViewRightPanel: React.FC<IPromosQuickViewData> = () => {
  const { permitStore, systemConfigurationStore } = useStores();

  const { t } = useTranslation();
  const { formatDateTime, firstDayOfWeek } = useIntl();
  const { dateFormat } = useDateIntl();

  const { values, errors, handleChange, setFieldValue } = useFormikContext<IPermit>();

  const selectedPermit = permitStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedPermit;

  const title = isNew || !values.number ? 'Create New Permit' : values.number;
  const subTitle = isNew || !values.expirationDate || formatDateTime(values.expirationDate).date;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{title}</Typography>
        <Typography shade="light" variant="caption" textTransform="uppercase">
          {subTitle}
        </Typography>
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
                  <Typography as="label" htmlFor="number" variant="bodyMedium" shade="light">
                    Number*
                  </Typography>
                </td>
                <td>
                  <FormInput
                    name="number"
                    onChange={handleChange}
                    value={values.number}
                    error={errors.number}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography
                    as="label"
                    htmlFor="expirationDate"
                    variant="bodyMedium"
                    shade="light"
                  >
                    Expiration Date*
                  </Typography>
                </td>
                <td>
                  <Calendar
                    name="expirationDate"
                    withInput
                    onDateChange={setFieldValue}
                    value={values.expirationDate}
                    placeholder={t('Text.SetDate')}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    error={errors.expirationDate as string}
                    minDate={tomorrow}
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

export default observer(PermitsQuickViewRightPanel);
