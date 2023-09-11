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
import { startCase } from 'lodash-es';
import { useHistory } from 'react-router-dom';
import { Paths } from '@root/consts';
import styles from '../css/styles.scss';
import { customStyles } from '../styles';
import {
  IQbAccounts,
  IQbBillableItemsData,
  IQbBillableItemsortedAccounts,
} from '../../../../../../types';
import { Account, TaxDistrictOption, BillableItem, TaxDistrict } from './types';

const I18N_PATH =
  'pages.SystemConfiguration.tables.CompanySettings.components.QbIntegrationSettings.Tabs.Text.';

interface RouteParams {
  id: string;
}
interface ITaxDistrictOptions {
  label: string;
  value: string;
}

const Taxes: React.FC = () => {
  const { qbAccountsStore, qbBillableItemsStore, taxDistrictStore } = useStores();
  const [sortedAccounts, setSortedAccounts] = useState<IQbBillableItemsortedAccounts[]>();
  const [taxDistrictOptions, setTaxDistrictOptions] = useState<ITaxDistrictOptions[]>();
  const { id } = useParams<RouteParams>();
  const { t } = useTranslation();
  const history = useHistory();

  const goBackToQbIntegrations = () => {
    history.push({
      pathname: Paths.SystemConfigurationModule.CompanySettings,
      search: '?tabKey=accountingIntegration',
    });
  };

  const formatBillableItems = (billableItems: Array<BillableItem>) => {
    const accounts: Array<Account> = [];
    billableItems?.forEach((element: BillableItem, index: number) => {
      if (index === 0) {
        accounts.push({
          accountName: element.accountName,
          billableItems: [
            {
              id: element.id,
              description: element.description,
              districtType: element.districtType,
              districtId: 0,
              type: 'tax',
            },
          ],
        });
      } else {
        const accountIndex = accounts.findIndex(
          (account: Account) => account.accountName === element.accountName,
        );
        if (accountIndex !== -1) {
          accounts[accountIndex].billableItems.push({
            id: element.id,
            description: element.description,
            districtType: element.districtType,
            districtId: 0,
            type: 'tax',
          });
        } else {
          accounts.push({
            accountName: element.accountName,
            billableItems: [
              {
                id: element.id,
                description: element.description,
                districtType: element.districtType,
                districtId: 0,
                type: 'tax',
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
      await taxDistrictStore.request();
      setTaxDistrictOptions(
        taxDistrictStore.values.map((taxDistrict: TaxDistrict) => ({
          label: taxDistrict.description,
          value: taxDistrict.description,
        })),
      );
      await qbBillableItemsStore.request(Number(id), ['tax']);
      setSortedAccounts(formatBillableItems(qbBillableItemsStore.values));
    })();
  }, [qbBillableItemsStore, taxDistrictStore, id]);

  const closeModal = useCallback(() => {
    qbAccountsStore.toggleModal();
  }, [qbAccountsStore]);

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

  const getAddAccountsSubmit = (filteredAccounts: IQbAccounts[] | undefined) => {
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
    const newAccounts = sortedAccounts?.map(account => {
      if (account.accountName === accountName) {
        account.billableItems?.push({
          id: `${accountIndex}-${account.billableItems.length}`,
          description: '',
          districtType: '',
          districtId: 0,
          type: 'tax',
        });
      }
      return account;
    });
    setSortedAccounts(newAccounts);
  };

  const changeBillableItem = (billableItemId: number, selectedOption: TaxDistrictOption) => {
    const newAccounts = sortedAccounts?.map(account => {
      const newBillableItems = account.billableItems?.map((billableItem: IQbBillableItemsData) => {
        if (billableItem.id === billableItemId) {
          const taxDistrictIndex = taxDistrictStore.values?.find(
            (taxDistrict: TaxDistrict) => taxDistrict.description === selectedOption?.value,
          );
          billableItem.description = selectedOption?.value;
          billableItem.districtType = taxDistrictIndex?.districtType;
          billableItem.districtId = taxDistrictIndex?.id;
        }
        return billableItem;
      });
      account.billableItems = newBillableItems;
      return account;
    });
    setSortedAccounts(newAccounts);
  };

  const saveConfig = () => {
    qbBillableItemsStore.insertMany(Number(id), sortedAccounts as IQbBillableItemsortedAccounts[], [
      'tax',
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
              {t(`${I18N_PATH}Description`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}DistrictType`)}
            </TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={3}>
            {sortedAccounts?.map((account: IQbBillableItemsortedAccounts, accountIndex: number) => (
              <TableRow key={accountIndex}>
                <TableCell colSpan={3}>
                  <div style={{ width: '100%' }}>
                    <CollapsibleBar
                      arrowLeft
                      label={<Typography variant="headerFive">{account.accountName}</Typography>}
                    >
                      <Layouts.Margin top="2">
                        {account.billableItems?.map(
                          (billableItem: IQbBillableItemsData, index: number) => (
                            <Layouts.Margin bottom="1" key={index}>
                              <Layouts.Grid columns={3} gap="2">
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
                                    options={taxDistrictOptions}
                                    value={
                                      {
                                        label: billableItem.description,
                                        value: billableItem.description,
                                      } as ITaxDistrictOptions
                                    }
                                    onChange={selectedOption =>
                                      changeBillableItem(billableItem.id as number, selectedOption)
                                    }
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell>
                                  <Layouts.Margin top="1" left="3">
                                    <Typography>{startCase(billableItem.districtType)}</Typography>
                                  </Layouts.Margin>
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
                              Add Line
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

export default observer(Taxes);
