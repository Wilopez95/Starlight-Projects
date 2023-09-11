import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, MonthPicker, Select } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { DescriptiveTooltip, FormInput, Switch, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ITruckAndDriverCost } from '@root/types';

import { DriverCosts, TruckCosts, TruckTypeCosts } from './sections';
import { ITruckAndDriverQuickViewRightPanel } from './types';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.QuickView.';

const TruckAndDriverQuickViewRightPanel: React.FC<ITruckAndDriverQuickViewRightPanel> = ({
  businessUnitOptions,
}) => {
  const { t } = useTranslation();
  const { values, errors, handleChange, setFieldValue } = useFormikContext<ITruckAndDriverCost>();
  const {
    truckAndDriverCostStore,
    systemConfigurationStore,
    truckTypeStore,
    truckStore,
    driverStore,
  } = useStores();
  const { dateFormat } = useIntl();
  const selectedTruckAndDriverCosts = truckAndDriverCostStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedTruckAndDriverCosts;
  const isDuplicating = systemConfigurationStore.isDuplicating;

  const checkIfTruckAndDriverCostsExist = useCallback(
    async (date: Date, buId: number | null) => {
      const truckAndDriverCosts = await truckAndDriverCostStore.requestByBusinessUnitOrDate({
        buId,
        date: format(date, dateFormat.ISO),
        detailed: true,
      });

      if (truckAndDriverCosts) {
        systemConfigurationStore.toggleCreating(false);
        truckAndDriverCostStore.selectEntity(truckAndDriverCosts);
      } else {
        truckAndDriverCostStore.unSelectEntity();
        systemConfigurationStore.toggleCreating(true);
        setFieldValue('businessUnitId', buId);
        setFieldValue('date', date);
      }
    },
    [truckAndDriverCostStore, systemConfigurationStore, dateFormat.ISO, setFieldValue],
  );

  const getOperatingParamByBU = useCallback(
    (id: number | null) => {
      const options = id
        ? {
            activeOnly: true,
            filterByBusinessUnit: [+id],
          }
        : { activeOnly: true };

      truckTypeStore.cleanup();
      truckStore.cleanup();
      driverStore.cleanup();

      truckTypeStore.requestAll(options);
      truckStore.requestAll(options);
      driverStore.requestAll(options);
    },
    [truckTypeStore, truckStore, driverStore],
  );

  const handleChangeDetailedCosts = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;

      setFieldValue(name, checked);
    },
    [setFieldValue],
  );

  const handleDateChange = useCallback(
    (name: string, date: Date) => {
      checkIfTruckAndDriverCostsExist(date, values.businessUnitId);
      setFieldValue(name, date);
    },
    [checkIfTruckAndDriverCostsExist, setFieldValue, values.businessUnitId],
  );

  const handleSelectChange = useCallback(
    (name: string, businessUnitId: number) => {
      checkIfTruckAndDriverCostsExist(values.date, businessUnitId || null);
      setFieldValue(name, businessUnitId);
    },
    [checkIfTruckAndDriverCostsExist, setFieldValue, values.date],
  );

  useEffect(() => {
    if (!isDuplicating) {
      const id = isNew ? values.businessUnitId : selectedTruckAndDriverCosts?.businessUnitId;

      getOperatingParamByBU(id ?? null);
    }
  }, [
    getOperatingParamByBU,
    isNew,
    isDuplicating,
    selectedTruckAndDriverCosts,
    values.businessUnitId,
  ]);

  const title = isNew
    ? t(`${I18N_PATH}Text.NewTrucksAndDriversCosts`)
    : t(`${I18N_PATH}Text.TrucksAndDriversCosts`);

  return (
    <>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree" ellipsis>
          {title}
        </Typography>
        <Divider top />
      </Layouts.Padding>
      <Layouts.Scroll>
        <Layouts.Padding padding="3">
          <Layouts.Box as={Layouts.Flex} justifyContent="space-between" width="100%">
            <Layouts.Flex flexGrow={1} alignItems="baseline">
              <Typography
                color="secondary"
                as="label"
                shade="desaturated"
                variant="bodyMedium"
                htmlFor="date"
              >
                {t(`${I18N_PATH}Text.EffectivePeriod`)}
              </Typography>
              <Layouts.Box maxWidth="180px" width="100%">
                <Layouts.Margin left="2">
                  <MonthPicker
                    name="date"
                    placeholder={t(`${I18N_PATH}Text.SetDate`)}
                    error={errors.date}
                    value={values.date}
                    format={dateFormat.dateMonthYear}
                    onChange={handleDateChange}
                  />
                </Layouts.Margin>
              </Layouts.Box>
            </Layouts.Flex>
            <Layouts.Flex flexGrow={2} alignItems="baseline" justifyContent="flex-end">
              <Typography
                color="secondary"
                as="label"
                shade="desaturated"
                variant="bodyMedium"
                htmlFor="businessUnitId"
              >
                {t(`${I18N_PATH}Text.BusinessUnit`)}
              </Typography>
              <Layouts.Box maxWidth="280px" width="100%">
                <Layouts.Margin left="2">
                  <Select
                    name="businessUnitId"
                    options={businessUnitOptions}
                    value={values.businessUnitId ?? 0}
                    onSelectChange={handleSelectChange}
                    nonClearable
                  />
                </Layouts.Margin>
              </Layouts.Box>
            </Layouts.Flex>
          </Layouts.Box>
          <Divider bottom />
          <Typography variant="headerFour">{t(`${I18N_PATH}Text.AverageCosts`)}</Typography>
          <Layouts.Margin top="3" bottom="1">
            <Layouts.Box as={Layouts.Flex} justifyContent="space-between" width="100%" gap="1rem 0">
              <Typography
                color="secondary"
                as="label"
                shade="light"
                variant="headerFive"
                textTransform="uppercase"
              >
                {t(`${I18N_PATH}Text.Description`)}
              </Typography>
              <Typography
                color="secondary"
                as="label"
                shade="light"
                variant="headerFive"
                textTransform="uppercase"
              >
                {t(`${I18N_PATH}Text.COGS/H`)}
              </Typography>
            </Layouts.Box>
          </Layouts.Margin>
          <Layouts.Box
            as={Layouts.Flex}
            alignItems="baseline"
            justifyContent="space-between"
            width="100%"
          >
            <Layouts.Flex flexGrow={1} alignItems="baseline" gap="0 1rem">
              <Typography variant="headerFive">{t(`${I18N_PATH}Text.AverageCosts`)}</Typography>
              <DescriptiveTooltip
                position="right"
                text={t(`${I18N_PATH}Tooltips.AverageCost`)}
                marker="i"
              />
            </Layouts.Flex>
            <Layouts.Box maxWidth="120px">
              <FormInput
                type="number"
                name="averageCost"
                inputTextAlign="right"
                value={values.averageCost}
                onChange={handleChange}
                error={errors.averageCost}
              />
            </Layouts.Box>
          </Layouts.Box>
          <Layouts.Box
            as={Layouts.Flex}
            alignItems="baseline"
            justifyContent="space-between"
            width="100%"
          >
            <Layouts.Flex flexGrow={1} alignItems="baseline" gap="0 1rem">
              <Typography variant="headerFive">{t(`${I18N_PATH}Text.TruckAverageCost`)}</Typography>
              <DescriptiveTooltip
                position="right"
                text={t(`${I18N_PATH}Tooltips.TruckAverageCost`)}
                marker="i"
              />
            </Layouts.Flex>
            <Layouts.Box maxWidth="120px">
              <FormInput
                type="number"
                name="truckAverageCost"
                inputTextAlign="right"
                value={values.truckAverageCost}
                onChange={handleChange}
                error={errors.truckAverageCost}
              />
            </Layouts.Box>
          </Layouts.Box>
          <Layouts.Box
            as={Layouts.Flex}
            alignItems="baseline"
            justifyContent="space-between"
            width="100%"
          >
            <Layouts.Flex flexGrow={1} alignItems="baseline" gap="0 1rem">
              <Typography variant="headerFive">
                {t(`${I18N_PATH}Text.DriverAverageCost`)}
              </Typography>
              <DescriptiveTooltip
                position="right"
                text={t(`${I18N_PATH}Tooltips.DriverAverageCost`)}
                marker="i"
              />
            </Layouts.Flex>
            <Layouts.Box maxWidth="120px">
              <FormInput
                type="number"
                name="driverAverageCost"
                inputTextAlign="right"
                value={values.driverAverageCost}
                onChange={handleChange}
                error={errors.driverAverageCost}
              />
            </Layouts.Box>
          </Layouts.Box>
          <Divider bottom />
          <Layouts.Flex justifyContent="space-between">
            <Typography variant="headerFour">
              {t(`${I18N_PATH}Text.OperatingCostsByUnit`)}
            </Typography>
            <Switch
              onChange={handleChangeDetailedCosts}
              value={values.detailedCosts}
              id="detailedCosts"
              name="detailedCosts"
            >
              {t(`${I18N_PATH}Text.SetAllCostsManually`)}
            </Switch>
          </Layouts.Flex>
          <Layouts.Padding top="2">
            <TruckTypeCosts />
            <TruckCosts />
            <DriverCosts />
          </Layouts.Padding>
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};

export default observer(TruckAndDriverQuickViewRightPanel);
