import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { type RawTimeZone } from '@vvo/tzdb';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';

import { CompanyService } from '@root/api';
import { Protected, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FormContainer } from '@root/components';
import { ConfirmModal } from '@root/components/modals';
import { convertDates, NotificationHelper } from '@root/helpers';
import { useBoolean, useStores, useUserContext } from '@root/hooks';
import { Regions } from '@root/i18n/config/region';
import { Units } from '@root/i18n/config/units';
import { buildI18Path } from '@root/i18n/helpers';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { IGeneralSettings } from '../../../../types';
import { GeneralSettings, initialValues, validationSchema } from './formikData';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.CompanySettings.components.General.',
);

const unitOptions: ISelectOption[] = [
  {
    label: 'US (Pound/(short)Ton/Yard)',
    value: Units.us,
  },
  { label: 'Imperial (Pound/(long)Ton/Yard)', value: Units.imperial },
  { label: 'Metric (Kilogram/Tonne/Meter)', value: Units.metric },
];

const regionOptions: ISelectOption[] = [
  {
    value: Regions.CA,
    label: 'Canada',
  },
  {
    value: Regions.US,
    label: 'USA',
  },
  {
    value: Regions.EU,
    label: 'Europe',
  },
  {
    value: Regions.GB,
    label: 'United Kingdom',
  },
];

const GeneralSettings: React.FC = () => {
  const [currentSettings, setCurrentSettings] = useState<GeneralSettings>();
  const timeZonesRef = useRef<RawTimeZone[]>([]);
  const { t } = useTranslation();
  const { i18nStore } = useStores();
  const [isConfirmModalOpen, openConfirmModal, closeConfirmModal] = useBoolean();
  const { updateUserInfo } = useUserContext();

  useEffect(() => {
    import('@vvo/tzdb').then(({ rawTimeZones }) => (timeZonesRef.current = rawTimeZones));
  }, []);

  const formik = useFormik<GeneralSettings>({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: currentSettings ?? initialValues,
    onSubmit: noop,
  });

  const { values, errors, setFieldValue, handleChange, isSubmitting, validateForm } = formik;

  const handleSubmit = useCallback(
    async (valuesData: IGeneralSettings) => {
      const errorsData = await validateForm();

      if (!isEmpty(errorsData)) {
        return;
      }
      try {
        await CompanyService.updateGeneralSettings(valuesData);
        updateUserInfo(true);

        NotificationHelper.success('update', 'General settings');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('generalSettings', typedError.response.code as ActionCode);
      } finally {
        closeConfirmModal();
      }
    },
    [closeConfirmModal, updateUserInfo, validateForm],
  );

  useEffect(() => {
    (async () => {
      try {
        const generalSettings = await CompanyService.getGeneralSettings();

        if (!isEmpty(generalSettings)) {
          setCurrentSettings(convertDates(generalSettings));
        }
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error(
          'update',
          typedError.response.code as ActionCode,
          'General settings',
        );
      }
    })();
  }, []);

  const timeZoneOptions: ISelectOption[] = timeZonesRef.current.map(timeZone => ({
    value: timeZone.name,
    label: timeZone.rawFormat,
  }));

  const handleSaveClick = useCallback(() => {
    if (
      values.unit &&
      ((i18nStore.region === Regions.US && values.unit !== Units.us) ||
        (i18nStore.region === Regions.GB && values.unit !== Units.imperial) ||
        (i18nStore.region === Regions.EU && values.unit !== Units.metric))
    ) {
      openConfirmModal();
    } else {
      handleSubmit(values as IGeneralSettings);
    }
  }, [handleSubmit, i18nStore.region, openConfirmModal, values]);

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        cancelButton="Cancel"
        submitButton="Save Changes"
        title={t(`${I18N_PATH.Text}UnitsOfMeasurement`)}
        subTitle={t(`${I18N_PATH.Text}ConfirmModalText`)}
        onCancel={closeConfirmModal}
        onSubmit={() => handleSubmit(values as IGeneralSettings)}
        nonDestructive
      />
      <Layouts.Flex flexGrow={1}>
        <Layouts.Box as={Layouts.Padding} width="100%" padding="4" backgroundColor="white">
          <FormContainer fullHeight formik={formik}>
            <Layouts.Flex
              as={Layouts.Box}
              height="100%"
              direction="column"
              justifyContent="space-between"
            >
              <Layouts.Box>
                <Layouts.Margin bottom="3">
                  <Layouts.Grid columns="0.75fr 1fr 1fr">
                    <Layouts.Padding top="1">
                      <Typography as="label" htmlFor="region" color="secondary" shade="light">
                        {t(`${I18N_PATH.Text}CompanyRegion`)}
                      </Typography>
                    </Layouts.Padding>
                    <Layouts.Box width="386px">
                      <Select
                        name="region"
                        options={regionOptions}
                        onSelectChange={setFieldValue}
                        value={i18nStore.region}
                        error={errors.region}
                        disabled
                      />
                    </Layouts.Box>
                  </Layouts.Grid>
                </Layouts.Margin>
                <Layouts.Margin bottom="3">
                  <Layouts.Grid columns="0.75fr 1fr 1fr">
                    <Layouts.Padding top="1">
                      <Typography as="label" htmlFor="unit" color="secondary" shade="light">
                        {t(`${I18N_PATH.Text}UnitsOfMeasurement`)}*
                      </Typography>
                    </Layouts.Padding>
                    <Layouts.Box width="386px">
                      <Select
                        name="unit"
                        options={unitOptions}
                        onSelectChange={setFieldValue}
                        value={values.unit}
                        error={errors.unit}
                        disabled
                      />
                    </Layouts.Box>
                  </Layouts.Grid>
                </Layouts.Margin>
                <Layouts.Margin bottom="3">
                  <Layouts.Grid columns="0.75fr 1fr 1fr">
                    <Layouts.Padding top="1">
                      <Typography as="label" htmlFor="timeZoneName" color="secondary" shade="light">
                        {t(`${I18N_PATH.Text}CompanyTimeZone`)}*
                      </Typography>
                    </Layouts.Padding>
                    <Layouts.Box width="386px">
                      <Select
                        name="timeZoneName"
                        options={timeZoneOptions}
                        onSelectChange={setFieldValue}
                        value={values.timeZoneName}
                        error={errors.timeZoneName}
                        searchable
                      />
                    </Layouts.Box>
                  </Layouts.Grid>
                </Layouts.Margin>
                <Layouts.Grid columns="0.75fr 1fr 1fr">
                  <Layouts.Padding top="1">
                    <Typography color="secondary" shade="light">
                      {t(`${I18N_PATH.Text}ClockInOutUsers`)}
                    </Typography>
                  </Layouts.Padding>
                  <Checkbox
                    id="clockIn"
                    name="clockIn"
                    value={values.clockIn}
                    onChange={handleChange}
                  >
                    {t('Text.Active')}
                  </Checkbox>
                </Layouts.Grid>
              </Layouts.Box>
              <Layouts.Box>
                <Layouts.Padding bottom="3">
                  <Divider />
                </Layouts.Padding>
                <Layouts.Flex justifyContent="flex-end">
                  <Protected permissions="configuration:company-settings:update">
                    <Button onClick={handleSaveClick} variant="primary" disabled={isSubmitting}>
                      {t(`${I18N_PATH.Text}SaveChanges`)}
                    </Button>
                  </Protected>
                </Layouts.Flex>
              </Layouts.Box>
            </Layouts.Flex>
          </FormContainer>
        </Layouts.Box>
      </Layouts.Flex>
    </>
  );
};

export default GeneralSettings;
