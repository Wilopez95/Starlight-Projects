import React, { useCallback, useEffect, useState } from 'react';
import { getIn, useFormik, FormikProvider } from 'formik';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import {
  TextInput,
  Layouts,
  Typography,
  Button,
  DatePicker,
} from '@starlightpro/shared-components';
import { useStores } from '@root/hooks';
import { Divider } from '@root/common/TableTools';
import { IQbIntegration } from '../../../../../../types';
import { getInitialValues, generateValidationSchema } from './formikData';
interface routeParams {
  id: string;
}

const Parameters: React.FC = () => {
  const { t } = useTranslation();
  const { qbIntegrationSettingsStore } = useStores();
  const [integrationPeriodData, setintegrationPeriodData] = useState<Date>(new Date());
  const { id } = useParams<routeParams>();
  const saveData = useCallback(
    async (values: IQbIntegration) => {
      values.integrationPeriod = integrationPeriodData;
      qbIntegrationSettingsStore.update(values, Number(id));
    },
    [qbIntegrationSettingsStore, integrationPeriodData],
  );

  const formik = useFormik<IQbIntegration>({
    initialValues: getInitialValues(),
    validationSchema: generateValidationSchema(),
    validateOnChange: false,
    onSubmit: saveData,
  });

  useEffect(() => {
    (async () => {
      await qbIntegrationSettingsStore.requestById(Number(id));
      if (qbIntegrationSettingsStore.selectedEntity) {
        formik.setValues({
          password: '',
          integrationPeriod: new Date(qbIntegrationSettingsStore.selectedEntity.integrationPeriod),
          dateToAdjustment: qbIntegrationSettingsStore.selectedEntity.dateToAdjustment,
          integrationBuList: qbIntegrationSettingsStore.selectedEntity.integrationBuList.toString(),
        } as IQbIntegration);
        setintegrationPeriodData(
          new Date(qbIntegrationSettingsStore.selectedEntity.integrationPeriod),
        );
      }
    })();
  }, [qbIntegrationSettingsStore]);

  const doNothing = useCallback(() => {}, []);
  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <Layouts.Box backgroundColor="white">
          <Layouts.Grid columns={2}>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>Parameter Name</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>Parameter Value</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
          </Layouts.Grid>
          <Divider />
          <Layouts.Grid columns={2}>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>{'Password'}</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
            <Layouts.Cell>
              <Layouts.Margin top="2">
                <TextInput
                  name="password"
                  type="password"
                  onChange={formik.handleChange}
                  value={getIn(formik.values, 'password')}
                  error={getIn(formik.errors, 'password')}
                />
              </Layouts.Margin>
            </Layouts.Cell>
          </Layouts.Grid>
          <Layouts.Grid columns={2}>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>{'Integration period start date'}</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
            <Layouts.Cell>
              <Layouts.Margin top="2">
                <DatePicker
                  name=""
                  format=""
                  value={integrationPeriodData}
                  onChange={(name, value) => setintegrationPeriodData(value)}
                />
              </Layouts.Margin>
            </Layouts.Cell>
          </Layouts.Grid>
          <Layouts.Grid columns={2}>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>{'Adjustment period (days)'}</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
            <Layouts.Cell>
              <Layouts.Margin top="2">
                <TextInput
                  name="dateToAdjustment"
                  onChange={formik.handleChange}
                  value={getIn(formik.values, 'dateToAdjustment')}
                  error={getIn(formik.errors, 'dateToAdjustment')}
                />
              </Layouts.Margin>
            </Layouts.Cell>
          </Layouts.Grid>
          <Layouts.Grid columns={2}>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>{'List of Business Units'}</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
            <Layouts.Cell>
              <Layouts.Margin top="2">
                <TextInput
                  name="integrationBuList"
                  onChange={formik.handleChange}
                  value={getIn(formik.values, 'integrationBuList')}
                  error={getIn(formik.errors, 'integrationBuList')}
                />
              </Layouts.Margin>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Box>
        <Layouts.Box minHeight="92px" backgroundColor="white">
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset" onClick={doNothing}>
                {t('Text.Cancel')}
              </Button>
              <Button type="submit" variant="primary">
                {t('Text.SaveChanges')}
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Box>
      </form>
    </FormikProvider>
  );
};

export default observer(Parameters);
