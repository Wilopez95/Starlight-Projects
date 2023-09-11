import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DatePicker, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import Select from 'react-select';
import { IBasicData } from '../../types';
import { QbIntegrationFormikData } from './formikData';

const I18N_PATH = 'quickViews.QbQuickViews.IntegrationSettings.RightPanel.Text.';

export interface SystemType {
  value: string;
  label: string;
}

const QbIntegrationQuickViewRightPanel: React.FC = () => {
  const { businessUnitStore, qbIntegrationSettingsStore } = useStores();
  const { t } = useTranslation();
  const { values, errors, handleChange } = useFormikContext<QbIntegrationFormikData>();
  const [integrationPeriodData, setintegrationPeriodData] = useState<Date>(new Date());
  const [businessUnit, setBusinessUnit] = useState<IBasicData[]>([]);
  const [listBusinessUnit, setListBusinessUnit] = useState<IBasicData[]>([]);
  const [systemType, setSystemType] = useState<SystemType>({
    value: 'QBFS',
    label: 'Quickbooks Desktop',
  });
  const systemTypeOptions = [{ value: 'QBFS', label: 'Quickbooks Desktop' }];
  const isCreating = !qbIntegrationSettingsStore.selectedEntity;

  const loadInitialData = useCallback(async () => {
    await businessUnitStore.request();
    const oldBuList = businessUnitStore.sortedValues.map(businessUnitValues => ({
      value: businessUnitValues.id,
      label: businessUnitValues.nameLine1,
    }));
    setListBusinessUnit(oldBuList);
  }, [businessUnitStore]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!isCreating && listBusinessUnit.length) {
      const integrationBUs = values.integrationBuList.map((bu: number) =>
        listBusinessUnit.find((tempBu: IBasicData) => tempBu.value === bu),
      );
      setBusinessUnit(integrationBUs as IBasicData[]);
      setintegrationPeriodData(new Date(values.lastSuccessfulIntegration));
    }
  }, [listBusinessUnit, isCreating]);

  const lastSuccessfulIntegrationChange = (date: string | number | Date) => {
    const newDate = new Date(date);
    values.lastSuccessfulIntegration = new Date(
      newDate.setDate(newDate.getDate() + 1),
    ).toDateString();
  };

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{t(`${I18N_PATH}Integration`)}</Typography>
        <Divider both />

        {isCreating ? (
          <>
            <Layouts.Grid columns={3}>
              <Layouts.Padding top="1.5">
                <Typography as="label" htmlFor="description" color="secondary">
                  {t(`${I18N_PATH}Description`)}
                </Typography>
              </Layouts.Padding>
            </Layouts.Grid>
            <Layouts.Padding top="1.5">
              <Layouts.Cell width={2}>
                <FormInput
                  name="description"
                  value={values.description}
                  error={errors.description}
                  onChange={handleChange}
                />
              </Layouts.Cell>
            </Layouts.Padding>

            <Layouts.Grid columns={3}>
              <Layouts.Padding top="1.5">
                <Typography as="label" htmlFor="provider" color="secondary">
                  {t(`${I18N_PATH}SystemType`)}
                </Typography>
              </Layouts.Padding>
            </Layouts.Grid>
            <Layouts.Padding top="1.5">
              <Layouts.Cell width={2}>
                <Select
                  name="systemType"
                  options={systemTypeOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={systemType}
                  onChange={e => {
                    setSystemType(e!);
                    values.systemType = e!.value;
                  }}
                />
              </Layouts.Cell>
            </Layouts.Padding>
          </>
        ) : null}

        <Layouts.Grid columns={3}>
          <Layouts.Padding top="1.5">
            <Typography as="label" htmlFor="provider" color="secondary">
              {t(`${I18N_PATH}BusinessUnit`)}
            </Typography>
          </Layouts.Padding>
        </Layouts.Grid>
        <Layouts.Padding top="1.5">
          <Layouts.Cell width={2}>
            <Select
              isMulti
              name="bussiness_unit"
              options={listBusinessUnit}
              className="basic-multi-select"
              classNamePrefix="select"
              value={businessUnit}
              onChange={e => {
                const BUsave: number[] = [];
                setBusinessUnit(e as IBasicData[]);
                e?.forEach(y => {
                  BUsave.push(y.value as number);
                });
                values.integrationBuList = BUsave;
              }}
            />
          </Layouts.Cell>
        </Layouts.Padding>
        <Divider both />

        <Layouts.Grid columns={3}>
          <Layouts.Padding top="1.5">
            <Typography as="label" htmlFor="name" color="secondary">
              {t(`${I18N_PATH}Password`)}
            </Typography>
          </Layouts.Padding>
        </Layouts.Grid>
        <Layouts.Padding top="1.5">
          <Layouts.Cell width={2}>
            <FormInput
              name="password"
              type="password"
              value={values.password}
              error={errors.password}
              onChange={handleChange}
            />
          </Layouts.Cell>
        </Layouts.Padding>
        <Divider both />

        <Layouts.Grid>
          <Layouts.Padding top="1.5">
            <Typography as="label" htmlFor="name" color="secondary">
              {t(`${I18N_PATH}AdjustmentPeriod`)}
            </Typography>
          </Layouts.Padding>
        </Layouts.Grid>
        <Layouts.Padding top="1.5">
          <Layouts.Cell width={2}>
            <FormInput
              type="number"
              name="dateToAdjustment"
              value={values.dateToAdjustment}
              error={errors.dateToAdjustment}
              onChange={handleChange}
            />
          </Layouts.Cell>
        </Layouts.Padding>

        <Layouts.Grid>
          <Layouts.Padding top="1.5">
            <Typography as="label" htmlFor="name" color="secondary">
              Last Successful Integration
            </Typography>
          </Layouts.Padding>
        </Layouts.Grid>
        <DatePicker
          name="last_successful_integration"
          format=""
          value={integrationPeriodData}
          onChange={(_name: string, value: Date) => {
            lastSuccessfulIntegrationChange(value);
          }}
        />
        <Divider both />
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(QbIntegrationQuickViewRightPanel);
