import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { startOfTomorrow } from 'date-fns';
import { useFormikContext } from 'formik';

import { FormInput, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { IMaterialProfile } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.MaterialProfiles.QuickView.MaterialProfilesQuickView.',
);

const tomorrow = startOfTomorrow();

export const MaterialProfilesQuickViewRightPanel: React.FC = () => {
  const { t } = useTranslation();
  const { materialProfileStore, disposalSiteStore, materialStore, systemConfigurationStore } =
    useStores();

  const selectedMaterialProfile = materialProfileStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedMaterialProfile;
  const { formatDateTime, firstDayOfWeek } = useIntl();

  const { values, errors, handleChange, setFieldValue } = useFormikContext<IMaterialProfile>();

  const materialOptions: ISelectOption[] = materialStore.sortedValues.map(material => ({
    label: material.description,
    value: material.id,
  }));

  const disposalSiteOptions: ISelectOption[] = disposalSiteStore.sortedValues.map(disposalSite => ({
    label: disposalSite.description,
    value: disposalSite.id,
  }));

  const { dateFormat } = useDateIntl();

  const title = isNew
    ? t(`${I18N_PATH.Text}CreateNew`)
    : values.description || selectedMaterialProfile?.description;

  const subTitle =
    isNew || !values.expirationDate ? '' : formatDateTime(values.expirationDate).date;

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
                <td className={styles.space}>{t('Text.Status')}</td>
                <td>
                  <Checkbox
                    id="activeCheckbox"
                    name="active"
                    value={values.active}
                    labelClass={styles.activeCheckbox}
                    onChange={handleChange}
                  >
                    {t('Text.Active')}
                  </Checkbox>
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
                    onChange={handleChange}
                    value={values.description}
                    error={errors.description}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography as="label" htmlFor="materialId" variant="bodyMedium" shade="light">
                    {t('Text.Material')}*
                  </Typography>
                </td>
                <td>
                  <Select
                    name="materialId"
                    key="materialId"
                    options={materialOptions}
                    value={values.materialId}
                    error={errors.materialId}
                    onSelectChange={setFieldValue}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.space}>
                  <Typography
                    as="label"
                    htmlFor="disposalSiteId"
                    variant="bodyMedium"
                    shade="light"
                  >
                    {t('Text.DisposalSite')}*
                  </Typography>
                </td>
                <td>
                  <Select
                    name="disposalSiteId"
                    key="disposalSiteId"
                    options={disposalSiteOptions}
                    value={values.disposalSiteId}
                    error={errors.disposalSiteId}
                    onSelectChange={setFieldValue}
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
                    {t('Text.ExpirationDate')}
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
                    error={errors.expirationDate}
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
