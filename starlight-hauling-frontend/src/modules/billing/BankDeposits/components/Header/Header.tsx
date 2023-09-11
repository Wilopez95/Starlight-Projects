import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { format, isSameDay, startOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { observer } from 'mobx-react-lite';

import { useBoolean, useBusinessContext, useStores, useTimeZone } from '@root/hooks';
import { dateFormatsEnUS } from '@root/i18n/format/date';

import { PlusIcon, PrintIcon } from '../../../../../assets';
import { Protected, Typography } from '../../../../../common';
import { BankDepositService } from '../../api/bankDeposit';
import { BankDepositStatus } from '../../types';
import RequestBankDepositModal from '../RequestBankDepositModal/RequestBankDeposit';

const today = startOfDay(new Date());

const Header: React.FC = () => {
  const { bankDepositStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [isModalOpen, openModal, closeModal] = useBoolean(false);
  const { timeZone } = useTimeZone();
  const checkedBankDeposits = bankDepositStore.checkedBankDeposits.length;

  const handleRequestNewBankDeposit = useCallback(() => {
    const todayInTimeZone = utcToZonedTime(format(today, dateFormatsEnUS.ISO), timeZone);
    const searchedBankDeposit = bankDepositStore.values.find(
      deposit =>
        deposit.status === BankDepositStatus.unLocked &&
        isSameDay(
          utcToZonedTime(format(deposit.date, dateFormatsEnUS.ISO), timeZone),
          todayInTimeZone,
        ),
    );

    if (searchedBankDeposit) {
      openModal();
    } else {
      bankDepositStore.lockBankDeposit({
        businessUnitId,
        date: today,
        isCreate: true,
      });
    }
  }, [bankDepositStore, businessUnitId, openModal, timeZone]);

  const handleDownloadBankDeposits = useCallback(() => {
    const bankDepositQueryParams = new URLSearchParams();
    const bankDepositIds =
      checkedBankDeposits > 0
        ? bankDepositStore.checkedBankDeposits.map(bankDeposit => bankDeposit.id)
        : bankDepositStore.values.map(bankDeposit => bankDeposit.id);

    bankDepositIds.forEach(id => bankDepositQueryParams.append('ids', id.toString()));

    BankDepositService.downloadBankDeposit(bankDepositQueryParams.toString());
  }, [bankDepositStore.checkedBankDeposits, bankDepositStore.values, checkedBankDeposits]);

  return (
    <Layouts.Margin bottom="2">
      <Layouts.Flex justifyContent="space-between" alignItems="center">
        <RequestBankDepositModal isOpen={isModalOpen} onClose={closeModal} />
        <Layouts.Flex alignItems="center" justifyContent="flex-start">
          {checkedBankDeposits === 0 ? (
            <Typography as="h1" variant="headerTwo">
              Bank Deposits
            </Typography>
          ) : (
            <Typography as="h1" variant="headerTwo">
              {checkedBankDeposits} Bank Deposit(s) selected
            </Typography>
          )}
        </Layouts.Flex>
        <Layouts.Flex>
          {checkedBankDeposits > 0 ? (
            <Layouts.Margin left="3">
              <Button iconLeft={PrintIcon} onClick={handleDownloadBankDeposits}>
                Print Bank Deposits
              </Button>
            </Layouts.Margin>
          ) : null}
          <Protected permissions="billing:bank-deposits:full-access">
            <Layouts.Margin left="3">
              <Button iconLeft={PlusIcon} variant="primary" onClick={handleRequestNewBankDeposit}>
                Request Bank Deposit
              </Button>
            </Layouts.Margin>
          </Protected>
        </Layouts.Flex>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(Header);
