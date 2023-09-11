import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import * as Sentry from '@sentry/react';
import { Button, Checkbox, Layouts, Typography } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CompanyService } from '@root/api';
import { SaveChangesBoundary } from '@root/common';
import { TablePageContainer } from '@root/common/TableTools';
import { ConfigurationAddresses, FormContainer } from '@root/components';
import { BillingCycleEnum, BillingTypeEnum, BusinessLineType, Paths, Routes } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { convertDates, pathToUrl } from '@root/helpers';
import { useCrudPermissions, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import {
  BusinessUnitType,
  IBaseComponent,
  IBusinessUnitWithServiceDays,
  ICompany,
} from '@root/types';

import Settings from './sections/Settings';
import { getEntityValues, getFormValues, validationSchema } from './formikData';
import {
  BusinessLines,
  CreditCardGateways,
  Information,
  LogoInformation,
  LogoRequirements,
  OriginsAndDestinations,
  PrintNodeApiKey,
  ServiceDaysAndTime,
} from './sections';

import styles from './sections/css/styles.scss';

const defaultRollOffBusinessLineData = {
  billingCycle: BillingCycleEnum.daily,
  billingType: BillingTypeEnum.arrears,
};

const I18N_PATH_BASE = 'pages.SystemConfiguration.tables.BusinessUnit.';
const I18N_PATH_TEXT = `${I18N_PATH_BASE}Text.`;
const I18N_PATH_VALIDATION_ERRORS = `${I18N_PATH_BASE}ValidationErrors.`;

const ConfigurationBusinessUnit: React.FC<IBaseComponent> = ({ className }) => {
  const { businessUnitStore, businessLineStore, lobbyStore, i18nStore } = useStores();

  const [_, canModifyBusinessUnits, canCreateBusinessUnits] = useCrudPermissions(
    'configuration',
    'business-units',
  );

  const history = useHistory();
  const { id: businessUnitId, businessUnitType } = useParams<{
    id: string;
    businessUnitType: BusinessUnitType;
  }>();
  const isNew = businessUnitId === Routes.Create;
  const businessUnit = businessUnitStore.selectedEntity;

  const intl = useIntl();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isNew && !!businessUnitId) {
      businessUnitStore.requestById(+businessUnitId);
    }

    return () => {
      businessUnitStore.unSelectEntity();
    };
  }, [isNew, businessUnitId, businessUnitStore]);

  const [company, setCompany] = useState<ICompany>();

  useEffect(() => {
    (async () => {
      try {
        setCompany(convertDates(await CompanyService.currentCompany()));
      } catch {
        Sentry.captureMessage('Company is not defined');
      }
    })();
  }, []);

  const handleSubmit = useCallback(
    async (data: IBusinessUnitWithServiceDays) => {
      const { serviceDays, ...formData } = getEntityValues(data);

      const rollOffBusinessLine = businessLineStore.values.find(
        businessLine => businessLine.type === BusinessLineType.rollOff,
      );

      const isRecyclingFacility = data.type === BusinessUnitType.RECYCLING_FACILITY;

      if (isNew) {
        let businessLines = [];

        if (isCore && rollOffBusinessLine && !isRecyclingFacility) {
          businessLines = [{ ...rollOffBusinessLine, ...defaultRollOffBusinessLineData }];
        } else {
          businessLines = formData.businessLines;
        }

        const unit = await businessUnitStore.create({
          ...formData,
          mailingAddress: {
            ...formData.mailingAddress,
            region: i18nStore.region,
          },
          physicalAddress: {
            ...formData.physicalAddress,
            region: i18nStore.region,
          },
          timeZoneName: formData.timeZoneName ?? null,
          businessLines,
        });

        if (isRecyclingFacility && unit && serviceDays?.length) {
          await businessUnitStore.setServiceDays(unit.id, serviceDays, isNew);
        }

        if (isRecyclingFacility) {
          businessLineStore.request();
        }

        if (unit?.id) {
          // redirect to the newly created business unit
          const url = pathToUrl(Paths.SystemConfigurationModule.BusinessUnit, {
            id: unit.id,
            businessUnitType: unit.type,
          });

          history.replace(url);
        }
      } else if (businessUnitId) {
        if (isRecyclingFacility && serviceDays?.length) {
          await businessUnitStore.setServiceDays(
            businessUnitId,
            serviceDays,
            !businessUnit?.serviceDays?.length,
          );
        }

        await businessUnitStore.update({
          ...formData,
          mailingAddress: {
            ...formData.mailingAddress,
            region: i18nStore.region,
          },
          physicalAddress: {
            ...formData.physicalAddress,
            region: i18nStore.region,
          },
        });
      }

      // after item updated lobby items have to re-fetched
      lobbyStore.clearResources();
    },
    [
      businessLineStore,
      businessUnit?.serviceDays?.length,
      businessUnitId,
      businessUnitStore,
      history,
      i18nStore.region,
      isNew,
      lobbyStore,
    ],
  );

  const initialValues = useMemo(
    () => getFormValues(businessUnitType, businessUnit),
    [businessUnit, businessUnitType],
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: validationSchema(businessUnitType, intl, t, I18N_PATH_VALIDATION_ERRORS),
    onSubmit: handleSubmit,
    validateOnChange: false,
  });

  const { errors, isSubmitting } = formik;

  const isRecyclingFacility = businessUnitType === BusinessUnitType.RECYCLING_FACILITY;

  useScrollOnError(errors, isSubmitting);

  return (
    <TablePageContainer
      as={SaveChangesBoundary}
      dirty={formik.dirty}
      onLeaveModal={formik.handleReset}
      className={className}
    >
      <Layouts.Scroll>
        <Layouts.Margin top="2" bottom="2">
          <Typography as="h1" variant="headerTwo" fontWeight="bold">
            {t(isNew ? `${I18N_PATH_TEXT}AddBusinessUnit` : `${I18N_PATH_TEXT}BusinessUnit`)}
          </Typography>
        </Layouts.Margin>

        <FormContainer formik={formik}>
          <LogoInformation />
          <LogoRequirements />
          {!isCore || enableRecyclingFeatures ? <BusinessLines /> : null}
          <CreditCardGateways
            isNew={isNew}
            selectedBusinessUnit={businessUnit ?? undefined}
            isRecyclingFacility={isRecyclingFacility}
          />
          {businessUnitType === BusinessUnitType.HAULING ? <Settings /> : null}
          <div className={styles.section}>
            <Information company={company} />
            <ConfigurationAddresses />
            {!isRecyclingFacility ? (
              <Layouts.Padding padding="3" top="0">
                <Checkbox name="spUsed" value={businessUnit?.spUsed} onChange={noop} disabled>
                  {t(`${I18N_PATH_TEXT}IntegratedWithSP`)}
                </Checkbox>
              </Layouts.Padding>
            ) : null}
            {isRecyclingFacility ? (
              <>
                <Layouts.Margin left="3" bottom="4">
                  <Typography variant="headerThree">
                    {t(`${I18N_PATH_TEXT}FacilitySettings`)}
                  </Typography>
                </Layouts.Margin>
                <ServiceDaysAndTime />
                <OriginsAndDestinations />
                <PrintNodeApiKey />
              </>
            ) : null}
            <div className={styles.buttonContainer}>
              {isNew && canCreateBusinessUnits ? (
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {t('Text.Create')}
                </Button>
              ) : null}
              {!isNew && canModifyBusinessUnits ? (
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {t(`${I18N_PATH_TEXT}SaveInfo`)}
                </Button>
              ) : null}
            </div>
          </div>
        </FormContainer>
      </Layouts.Scroll>
    </TablePageContainer>
  );
};

export default observer(ConfigurationBusinessUnit);
