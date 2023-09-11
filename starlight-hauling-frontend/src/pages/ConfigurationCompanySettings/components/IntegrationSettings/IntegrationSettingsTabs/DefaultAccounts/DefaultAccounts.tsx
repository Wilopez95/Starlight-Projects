import React, { useCallback, useEffect } from 'react';
import { getIn, useFormik, FormikProvider } from 'formik';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { TextInput, Layouts, Typography, Button } from '@starlightpro/shared-components';
import { Divider, TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { useHistory } from 'react-router-dom';
import { Paths } from '@root/consts';
import { IQbIntegration } from '../../../../../../types';
import { getInitialValues, generateValidationSchema } from './formikData';
interface routeParams {
  id: string;
}
const DefaultAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { qbIntegrationSettingsStore } = useStores();
  const { id } = useParams<routeParams>();
  const saveData = useCallback(
    async (values: IQbIntegration) => {
      qbIntegrationSettingsStore.update(values, Number(id));
    },
    [qbIntegrationSettingsStore],
  );
  const history = useHistory();

  const goBackToQbIntegrations = () => {
    history.push({
      pathname: Paths.SystemConfigurationModule.CompanySettings,
      search: '?tabKey=accountingIntegration',
    });
  };

  const formik = useFormik<IQbIntegration>({
    initialValues: getInitialValues() as IQbIntegration,
    validationSchema: generateValidationSchema(),
    validateOnChange: false,
    onSubmit: saveData,
  });

  useEffect(() => {
    (async () => {
      await qbIntegrationSettingsStore.requestById(Number(id));
      if (qbIntegrationSettingsStore.selectedEntity) {
        formik.setValues({
          accountReceivable: qbIntegrationSettingsStore.selectedEntity.accountReceivable,
          defaultAccountIncome: qbIntegrationSettingsStore.selectedEntity.defaultAccountIncome,
          defaultAccountTax: qbIntegrationSettingsStore.selectedEntity.defaultAccountTax,
          defaultPaymentAccount: qbIntegrationSettingsStore.selectedEntity.defaultPaymentAccount,
          defaultAccountFinCharges:
            qbIntegrationSettingsStore.selectedEntity.defaultAccountFinCharges,
          writeoffAccount: qbIntegrationSettingsStore.selectedEntity.writeoffAccount,
          creditMemoAccount: qbIntegrationSettingsStore.selectedEntity.creditMemoAccount,
        } as IQbIntegration);
      }
    })();
  }, [qbIntegrationSettingsStore]);

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <Layouts.Box backgroundColor="white">
          <Layouts.Grid columns={2}>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>Account Name</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
            <Layouts.Cell>
              <Layouts.Margin margin="3">
                <Typography>Account Alias</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Box>
        <Divider />
        <Layouts.Box style={{ height: '55vh', minHeight: '300px' }}>
          <TableTools.ScrollContainer>
            <Layouts.Grid columns={2}>
              <Layouts.Cell>
                <Layouts.Margin margin="3">
                  <Typography>{'Account Receivable'}</Typography>
                </Layouts.Margin>
              </Layouts.Cell>
              <Layouts.Cell>
                <Layouts.Margin top="2" right="3">
                  <TextInput
                    name="accountReceivable"
                    onChange={formik.handleChange}
                    value={getIn(formik.values, 'accountReceivable')}
                    error={getIn(formik.errors, 'accountReceivable')}
                  />
                </Layouts.Margin>
              </Layouts.Cell>
            </Layouts.Grid>
            <Layouts.Grid columns={2}>
              <Layouts.Cell>
                <Layouts.Margin margin="3">
                  <Typography>{'Default Account Income Credit'}</Typography>
                </Layouts.Margin>
              </Layouts.Cell>
              <Layouts.Cell>
                <Layouts.Margin top="2" right="3">
                  <TextInput
                    name="defaultAccountIncome"
                    onChange={formik.handleChange}
                    value={getIn(formik.values, 'defaultAccountIncome')}
                    error={getIn(formik.errors, 'defaultAccountIncome')}
                  />
                </Layouts.Margin>
              </Layouts.Cell>
            </Layouts.Grid>
            <Layouts.Grid columns={2}>
              <Layouts.Cell>
                <Layouts.Margin margin="3">
                  <Typography>{'Default Account Tax Credit'}</Typography>
                </Layouts.Margin>
              </Layouts.Cell>
              <Layouts.Cell>
                <Layouts.Margin top="2" right="3">
                  <TextInput
                    name="defaultAccountTax"
                    onChange={formik.handleChange}
                    value={getIn(formik.values, 'defaultAccountTax')}
                    error={getIn(formik.errors, 'defaultAccountTax')}
                  />
                </Layouts.Margin>
              </Layouts.Cell>
            </Layouts.Grid>
            <Layouts.Grid columns={2}>
              <Layouts.Cell>
                <Layouts.Margin margin="3">
                  <Typography>{'Default Payment Account'}</Typography>
                </Layouts.Margin>
              </Layouts.Cell>
              <Layouts.Cell>
                <Layouts.Margin top="2" right="3">
                  <TextInput
                    name="defaultPaymentAccount"
                    onChange={formik.handleChange}
                    value={getIn(formik.values, 'defaultPaymentAccount')}
                    error={getIn(formik.errors, 'defaultPaymentAccount')}
                  />
                </Layouts.Margin>
              </Layouts.Cell>
            </Layouts.Grid>
            <Layouts.Grid columns={2}>
              <Layouts.Cell>
                <Layouts.Margin margin="3">
                  <Typography>{'Default Account Fin Charges Credit'}</Typography>
                </Layouts.Margin>
              </Layouts.Cell>
              <Layouts.Cell>
                <Layouts.Margin top="2" right="3">
                  <TextInput
                    name="defaultAccountFinCharges"
                    onChange={formik.handleChange}
                    value={getIn(formik.values, 'defaultAccountFinCharges')}
                    error={getIn(formik.errors, 'defaultAccountFinCharges')}
                  />
                </Layouts.Margin>
              </Layouts.Cell>
            </Layouts.Grid>
            <Layouts.Grid columns={2}>
              <Layouts.Cell>
                <Layouts.Margin margin="3">
                  <Typography>{'Writeoff Account Debit'}</Typography>
                </Layouts.Margin>
              </Layouts.Cell>
              <Layouts.Cell>
                <Layouts.Margin top="2" right="3">
                  <TextInput
                    name="writeoffAccount"
                    onChange={formik.handleChange}
                    value={getIn(formik.values, 'writeoffAccount')}
                    error={getIn(formik.errors, 'writeoffAccount')}
                  />
                </Layouts.Margin>
              </Layouts.Cell>
            </Layouts.Grid>
            <Layouts.Grid columns={2}>
              <Layouts.Cell>
                <Layouts.Margin margin="3">
                  <Typography>{'Credit Memo Account Debit'}</Typography>
                </Layouts.Margin>
              </Layouts.Cell>
              <Layouts.Cell>
                <Layouts.Margin top="2" right="3">
                  <TextInput
                    name="creditMemoAccount"
                    onChange={formik.handleChange}
                    value={getIn(formik.values, 'creditMemoAccount')}
                    error={getIn(formik.errors, 'creditMemoAccount')}
                  />
                </Layouts.Margin>
              </Layouts.Cell>
            </Layouts.Grid>
          </TableTools.ScrollContainer>
        </Layouts.Box>
        <Layouts.Box minHeight="92px" backgroundColor="white">
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset" onClick={goBackToQbIntegrations}>
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

export default observer(DefaultAccounts);
