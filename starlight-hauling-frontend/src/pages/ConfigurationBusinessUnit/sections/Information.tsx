import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { type RawTimeZone } from '@vvo/tzdb';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { PhoneField } from '@root/components';
import { IBusinessUnit } from '@root/types';
import { useStores } from '@hooks';

import { type BusinessUnitInformationSection } from './types';

import styles from './css/styles.scss';

const I18N_PATH_BASE = 'pages.SystemConfiguration.tables.BusinessUnit.sections.Information.';
const I18N_PATH_TEXT = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_FORM = `${I18N_PATH_BASE}Form.`;

const Section: React.FC<BusinessUnitInformationSection> = ({ company }) => {
  const { values, errors, handleChange, setFormikState, setFieldValue } =
    useFormikContext<IBusinessUnit>();
  const timeZonesRef = useRef<RawTimeZone[]>([]);
  const { t } = useTranslation();
  const { i18nStore } = useStores();

  useEffect(() => {
    import('@vvo/tzdb').then(({ rawTimeZones }) => (timeZonesRef.current = rawTimeZones));
  }, []);

  const applyCompanyProfile = useCallback(
    () =>
      company &&
      setFormikState(state => ({
        ...state,
        errors: {},
        values: {
          ...values,
          nameLine1: company.companyNameLine1,
          nameLine2: company.companyNameLine2 ?? null,
          physicalAddress: { ...company.physicalAddress, region: i18nStore.region },
          mailingAddress: { ...company.mailingAddress, region: i18nStore.region },
          phone: company.phone,
          fax: company.fax ?? null,
          email: company.officialEmail ?? null,
          website: company.officialWebsite ?? null,
          timeZoneName: company.timeZoneName || null,
          logoUrl: company.logoUrl ?? null,
        },
      })),
    [company, setFormikState, values, i18nStore.region],
  );

  const timeZoneOptions: ISelectOption[] = timeZonesRef.current.map(timeZone => ({
    value: timeZone?.name,
    label: timeZone.rawFormat,
  }));

  return (
    <Layouts.Padding padding="3">
      <Button className={styles.applyCompanyProfile} onClick={applyCompanyProfile}>
        {t(`${I18N_PATH_TEXT}UseInfo`)}
      </Button>
      <Typography variant="headerThree" className={styles.spaceBottom}>
        {t(`${I18N_PATH_TEXT}BusinessUnit`)}
      </Typography>
      <Typography fontWeight="bold" className={styles.spaceBottom}>
        {t(`${I18N_PATH_TEXT}GeneralInfo`)}
      </Typography>
      <Layouts.Flex>
        <Layouts.Column>
          <Layouts.Flex>
            <Layouts.Column>
              <PhoneField
                name="phone"
                label={`${t(`${I18N_PATH_FORM}Phone`)}*`}
                value={values.phone}
                onChange={handleChange}
                error={errors.phone}
              />
            </Layouts.Column>
            <Layouts.Column>
              <FormInput
                name="website"
                label={t(`${I18N_PATH_FORM}OfficialWebSite`)}
                value={values.website ?? undefined}
                onChange={handleChange}
                error={errors.website}
              />
              <PhoneField
                name="fax"
                label={t(`${I18N_PATH_FORM}Fax`)}
                value={values.fax ?? undefined}
                onChange={handleChange}
                error={errors.fax}
              />
            </Layouts.Column>
          </Layouts.Flex>
        </Layouts.Column>
        <Layouts.Column>
          <Layouts.Flex>
            <Layouts.Column>
              <FormInput
                name="email"
                label={t(`${I18N_PATH_FORM}OfficialEmail`)}
                value={values.email ?? undefined}
                onChange={handleChange}
                error={errors.email}
              />
              <Select
                name="timeZoneName"
                label={t(`${I18N_PATH_FORM}TimeZone`)}
                options={timeZoneOptions}
                onSelectChange={setFieldValue}
                value={values.timeZoneName ?? ''}
                error={errors.timeZoneName}
                searchable
              />
            </Layouts.Column>
          </Layouts.Flex>
        </Layouts.Column>
      </Layouts.Flex>
    </Layouts.Padding>
  );
};

export default observer(Section);
