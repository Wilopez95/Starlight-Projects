import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Select } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { normalizeOptions } from '@root/helpers';
import { useStores, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { IDisposalRateFormData } from './formikData';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.DisposalSites.DisposalRatesQuickView.',
);

const DisposalRatesQuickViewRightPanel: React.FC = ({ children }) => {
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IDisposalRateFormData>();

  const { disposalSiteStore, materialStore } = useStores();
  const { t } = useTranslation();
  const intl = useIntl();
  const { currentUser } = useUserContext();

  const selectedDisposalSite = disposalSiteStore.selectedEntity;

  const rateUnitsOptions =
    currentUser?.company?.unit === Units.metric
      ? normalizeOptions([
          { value: 'ton', label: 'Tonne' },
          { value: 'yard', label: 'Meter' },
        ])
      : normalizeOptions(['ton', 'yard']);

  const handleUnitChange = useCallback(
    (value: string | number, index: number) => {
      setFieldValue(`disposalRates[${index}].unit`, value);
    },
    [setFieldValue],
  );

  return (
    <>
      <Layouts.Padding padding="3" bottom="0">
        <Layouts.Box as={Layouts.Flex} justifyContent="space-between" width="100%">
          <Layouts.Flex direction="column">
            <Typography variant="headerThree"> {t(`${I18N_PATH.Form}DisposalRates`)}</Typography>

            <Typography variant="caption" textTransform="uppercase">
              {startCase(selectedDisposalSite?.description)}
            </Typography>
          </Layouts.Flex>
          <Layouts.Flex flexGrow={1} alignItems="center" justifyContent="flex-end">
            <Typography as="label" htmlFor="lineOfBusiness">
              {t(`${I18N_PATH.Form}LineOfBusiness`)}
            </Typography>
            <Layouts.Box maxWidth="250px" width="100%">
              {children}
            </Layouts.Box>
          </Layouts.Flex>
        </Layouts.Box>
        <Divider top />
      </Layouts.Padding>
      <Layouts.Scroll>
        <Layouts.Padding padding="3">
          <Layouts.Grid columnGap="3" columns="5fr 2fr 2fr">
            <Typography
              variant="bodyMedium"
              color="secondary"
              shade="light"
              textTransform="uppercase"
              as={Layouts.Margin}
              bottom="2"
            >
              {t(`${I18N_PATH.Form}Material`)}
            </Typography>
            <Typography
              variant="bodyMedium"
              color="secondary"
              shade="light"
              textTransform="uppercase"
              as={Layouts.Margin}
              bottom="2"
            >
              {t(`${I18N_PATH.Form}Units`)}
            </Typography>
            <Typography
              variant="bodyMedium"
              color="secondary"
              shade="light"
              textTransform="uppercase"
              as={Layouts.Margin}
              bottom="2"
            >
              {t(`${I18N_PATH.Form}DisposalRate`, { currencySymbol: intl.currencySymbol })}
            </Typography>
            <FieldArray name="disposalRates">
              {() => {
                return values.disposalRates.map((disposalRate, index) => {
                  const material = materialStore.getById(disposalRate.materialId);

                  if (!material) {
                    return null;
                  }

                  return (
                    <React.Fragment key={material.id}>
                      <Layouts.Box maxWidth="100%" overflowHidden>
                        <Typography
                          variant="bodyMedium"
                          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {material?.description}
                        </Typography>
                      </Layouts.Box>
                      <Select
                        name={`disposalRates[${index}].unit`}
                        options={rateUnitsOptions}
                        ariaLabel={t(`${I18N_PATH.Form}Unit`)}
                        value={disposalRate.unit}
                        onSelectChange={(_, value) => handleUnitChange(value, index)}
                        nonClearable
                        noErrorMessage
                      />
                      <FormInput
                        name={`disposalRates[${index}].rate`}
                        ariaLabel={t(`${I18N_PATH.Form}Rate`)}
                        value={disposalRate.rate}
                        onChange={handleChange}
                        error={getIn(errors, `disposalRates[${index}].rate`)}
                      />
                    </React.Fragment>
                  );
                });
              }}
            </FieldArray>
          </Layouts.Grid>
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};

export default observer(DisposalRatesQuickViewRightPanel);
