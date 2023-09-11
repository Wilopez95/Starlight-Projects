import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
  Divider,
} from '@root/common/TableTools';
import { Typography } from '@root/common';
import Select from 'react-select';
import { CollapsibleBar, Layouts, Button } from '@starlightpro/shared-components';

import { useStores } from '@root/hooks';
import { QbAddAccountModal } from '@root/components/modals';
import { DeleteIcon, PlusIcon } from '@root/assets';
import { useHistory } from 'react-router-dom';
import { Paths } from '@root/consts';
import styles from '../css/styles.scss';
import { customStyles } from '../styles';
import {
  IBasicData,
  IPaymentMethodsOptions,
  IQbAccounts,
  IQbBillableItemsData,
  IQbBillableItemsortedAccounts,
} from '../../../../../../types';
const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.QbIntegrationSettings.Tabs.Text.';

interface routeParams {
  id: string;
}

const paymentMethodsOptions: IPaymentMethodsOptions[] = [
  {
    label: 'Cash',
    value: 'cash',
  },
  {
    label: 'Check / ACH',
    value: 'check',
  },
  {
    label: 'Credit Card',
    value: 'creditCard',
  },
];

const Payments: React.FC = () => {
  const { qbAccountsStore, qbBillableItemsStore } = useStores();
  const [sortedAccounts, setSortedAccounts] = useState<IQbBillableItemsortedAccounts[]>();
  const { t } = useTranslation();
  const { id } = useParams<routeParams>();
  const closeModal = useCallback(() => {
    qbAccountsStore.toggleModal();
  }, []);
  const history = useHistory();

  const goBackToQbIntegrations = () => {
    history.push({
      pathname: Paths.SystemConfigurationModule.CompanySettings,
      search: '?tabKey=accountingIntegration',
    });
  };

  const formatBillableItems = (billableItems: IQbBillableItemsortedAccounts[]) => {
    const accounts: IQbBillableItemsortedAccounts[] = [];
    billableItems?.forEach((element: IQbBillableItemsortedAccounts, index: number) => {
      const paymentMethodIndex = paymentMethodsOptions?.find(
        (paymentMethod: IPaymentMethodsOptions) => paymentMethod.value === element.paymentMethodId,
      );
      if (index == 0) {
        accounts.push({
          accountName: element.accountName,
          billableItems: [
            {
              id: element.id,
              description: paymentMethodIndex?.label,
              paymentMethodId: paymentMethodIndex?.value,
              type: 'payment',
            },
          ],
        });
      } else {
        const accountIndex = accounts.findIndex(
          (account: IQbBillableItemsortedAccounts) => account.accountName === element.accountName,
        );
        if (accountIndex !== -1) {
          accounts[accountIndex].billableItems?.push({
            id: element.id,
            description: paymentMethodIndex?.label,
            paymentMethodId: paymentMethodIndex?.value,
            type: 'payment',
          });
        } else {
          accounts.push({
            accountName: element.accountName,
            billableItems: [
              {
                id: element.id,
                description: paymentMethodIndex?.label,
                paymentMethodId: paymentMethodIndex?.value,
                type: 'payment',
              },
            ],
          });
        }
      }
    });
    return accounts;
  };

  useEffect(() => {
    (async () => {
      await qbBillableItemsStore.request(Number(id), ['payment']);
      setSortedAccounts(formatBillableItems(qbBillableItemsStore.values));
    })();
  }, [qbBillableItemsStore]);

  const deleteBillableItem = useCallback(
    (accountName, billableItemId) => {
      const temporarySetup: IQbBillableItemsortedAccounts[] = JSON.parse(
        JSON.stringify(sortedAccounts),
      );
      const selectedAccount = temporarySetup?.find(
        (account: IQbBillableItemsortedAccounts) => account.accountName === accountName,
      );
      const billableItemIndex = selectedAccount?.billableItems?.findIndex(
        (billableItem: IQbBillableItemsData) => billableItem.id === billableItemId,
      );
      if (billableItemIndex !== undefined && (billableItemIndex > 0 || billableItemIndex === 0)) {
        selectedAccount?.billableItems?.splice(billableItemIndex, 1);
        setSortedAccounts(temporarySetup);
      }
      if (selectedAccount?.billableItems?.length === 0) {
        const accountIndex = temporarySetup?.findIndex(
          (account: IQbBillableItemsortedAccounts) => account.accountName === accountName,
        );
        if (accountIndex !== undefined && (accountIndex > 0 || accountIndex === 0)) {
          temporarySetup?.splice(accountIndex, 1);
          setSortedAccounts(temporarySetup);
        }
      }
    },
    [sortedAccounts],
  );

  const getAddAccountsSubmit = (filteredAccounts?: IQbAccounts[]) => {
    const newAccounts: IQbBillableItemsortedAccounts[] = JSON.parse(JSON.stringify(sortedAccounts));
    filteredAccounts?.forEach((filteredAccount: IQbAccounts) => {
      const accountIndex = newAccounts?.findIndex(
        (account: IQbBillableItemsortedAccounts) => account.accountName === filteredAccount.name,
      );
      if (accountIndex === -1) {
        newAccounts?.push({
          accountName: filteredAccount.name,
          billableItems: [],
        });
      }
    });
    setSortedAccounts(newAccounts);
    closeModal();
  };

  const addNewLine = (accountIndex: number, accountName: string) => {
    const newAccounts = sortedAccounts?.map((account: IQbBillableItemsortedAccounts) => {
      if (account.accountName === accountName) {
        account.billableItems?.push({
          id: `${accountIndex}-${account.billableItems.length}`,
          description: '',
          paymentMethodId: '',
          type: '',
        });
      }
      return account;
    });
    setSortedAccounts(newAccounts);
  };

  const handleSelectChange = (
    billableItemId: number,
    selectedOption: IBasicData,
    selectType: string,
  ) => {
    const newAccounts = sortedAccounts?.map(account => {
      const newBillableItems = account.billableItems?.forEach(
        (billableItem: IQbBillableItemsData) => {
          // it has to be a foreach because we can use the null value as result
          if (billableItem.id === billableItemId) {
            let typeIndex;
            switch (selectType) {
              case 'payment':
                typeIndex = paymentMethodsOptions?.find(
                  (paymentMethod: IPaymentMethodsOptions) =>
                    paymentMethod.value === selectedOption.value,
                );
                billableItem.description = typeIndex?.label;
                billableItem.paymentMethodId = typeIndex?.value;
                billableItem.type = 'payment';
                break;
              default:
                return null;
            }
          }
          return billableItem;
        },
      );
      account.billableItems = newBillableItems ?? undefined;
      return account;
    });
    setSortedAccounts(newAccounts);
  };

  const saveConfig = () => {
    qbBillableItemsStore.insertMany(Number(id), sortedAccounts as IQbBillableItemsortedAccounts[], [
      'payment',
    ]);
  };

  return (
    <>
      <QbAddAccountModal
        isOpen={qbAccountsStore.isOpenModal}
        onClose={closeModal}
        onFormSubmit={getAddAccountsSubmit}
      />
      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}AccountName`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}PaymentType`)}
            </TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={2}>
            {sortedAccounts?.map((account: IQbBillableItemsortedAccounts, accountIndex: number) => (
              <TableRow key={accountIndex}>
                <TableCell colSpan={2}>
                  <div style={{ width: '100%' }}>
                    <CollapsibleBar
                      arrowLeft
                      label={<Typography variant="headerFive">{account.accountName}</Typography>}
                    >
                      <Layouts.Margin top="2">
                        {account.billableItems?.map(
                          (billableItem: IQbBillableItemsData, index: number) => (
                            <Layouts.Margin bottom="1" key={index}>
                              <Layouts.Grid columns={2} gap="2">
                                <Layouts.Cell>
                                  <Layouts.Flex>
                                    <DeleteIcon
                                      role="button"
                                      tabIndex={0}
                                      onClick={() =>
                                        deleteBillableItem(account.accountName, billableItem.id)
                                      }
                                      className={styles.removeIcon}
                                    />
                                    <Layouts.Margin margin="1">
                                      <Typography variant="bodyMedium">{`#${
                                        index + 1
                                      }`}</Typography>
                                    </Layouts.Margin>
                                  </Layouts.Flex>
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Select
                                    menuPosition="fixed"
                                    styles={customStyles}
                                    options={paymentMethodsOptions}
                                    value={
                                      {
                                        label: billableItem.description,
                                        value: billableItem.paymentMethodId,
                                      } as IPaymentMethodsOptions
                                    }
                                    onChange={selectedOption =>
                                      handleSelectChange(
                                        billableItem.id as number,
                                        selectedOption as IPaymentMethodsOptions,
                                        'payment',
                                      )
                                    }
                                  />
                                </Layouts.Cell>
                              </Layouts.Grid>
                            </Layouts.Margin>
                          ),
                        )}
                      </Layouts.Margin>
                      <Layouts.Flex>
                        <Button
                          variant="none"
                          onClick={() => addNewLine(accountIndex, account.accountName)}
                        >
                          <Layouts.Flex alignItems="center" justifyContent="center">
                            <Layouts.IconLayout height="12px" width="12px">
                              <PlusIcon />
                            </Layouts.IconLayout>
                            <Typography color="information" cursor="pointer" variant="bodyMedium">
                              {'Add Line'}
                            </Typography>
                          </Layouts.Flex>
                        </Button>
                      </Layouts.Flex>
                    </CollapsibleBar>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
      <Layouts.Box minHeight="92px" backgroundColor="white">
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={goBackToQbIntegrations}>
              {t('Text.Cancel')}
            </Button>
            <Button type="submit" variant="primary" onClick={saveConfig}>
              {t('Text.SaveChanges')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};

export default observer(Payments);
