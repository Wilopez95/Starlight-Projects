import * as Sentry from '@sentry/react';
import { format } from 'date-fns';
import { action, computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { BankDepositService } from '../api/bankDeposit';

import { BankDepositRequestParams, BankDepositSortType, BankDepositStatus } from '../types';

import { BankDeposit } from './BankDeposit';

export class BankDepositStore extends BaseStore<BankDeposit, BankDepositSortType> {
  private readonly service: BankDepositService;

  constructor(global: GlobalStore) {
    super(global, 'DATE', 'desc');
    this.service = new BankDepositService();
  }

  @actionAsync
  async request({ businessUnitId }: BankDepositRequestParams) {
    this.loading = true;
    try {
      const bankDepositResponse = await task(
        this.service.getAll({
          limit: this.limit,
          offset: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          businessUnitId,
        }),
      );

      this.validateLoading(bankDepositResponse.bankDeposits, this.limit);

      this.setItems(
        bankDepositResponse.bankDeposits.map(bankDeposits => new BankDeposit(this, bankDeposits)),
      );

      return bankDepositResponse;
    } catch (error) {
      const typedError = error as ApiError;

      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BankDeposit',
        message: `Bank Deposits Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
        },
      });
      Sentry.captureException(typedError);
    } finally {
      this.offset += this.limit;
      this.loading = false;
    }
  }

  @actionAsync
  async requestDetailed(id: number) {
    this.loading = true;
    try {
      const { bankDeposit } = await task(this.service.getById({ id }));

      if (bankDeposit) {
        const detailedBankDeposit = new BankDeposit(this, bankDeposit);

        this.setItem(detailedBankDeposit);
        this.updateSelectedEntity(detailedBankDeposit);
      }
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BankDeposit',
        message: `Bank Deposit Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async deleteBankDeposit(id: number) {
    const bankDeposit = this.getById(id);

    try {
      this.removeEntity(id);

      await task(this.service.deleteBankDeposit(id));

      NotificationHelper.success('delete', 'Bank Deposit');
    } catch (error) {
      const typedError = error as ApiError;

      if (bankDeposit) {
        this.setItem(bankDeposit);
      }
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Bank Deposit');
      Sentry.addBreadcrumb({
        category: 'BankDeposit',
        message: `Bank Deposit Delete By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async lockBankDeposit({
    businessUnitId,
    id,
    date,
    isCreate,
  }: {
    businessUnitId: string;
    date: Date;
    id?: number;
    isCreate?: boolean;
  }) {
    try {
      const { lockBankDeposit } = await task(
        this.service.lockBankDeposit(businessUnitId, format(date, dateFormatsEnUS.ISO)),
      );

      const prevUnlockedDeposit = this.getById(id);

      if (prevUnlockedDeposit) {
        prevUnlockedDeposit.status = BankDepositStatus.locked;
      }

      if (lockBankDeposit) {
        const bankDepositEntity = new BankDeposit(this, lockBankDeposit);

        this.setItem(bankDepositEntity);
      }

      if (isCreate) {
        NotificationHelper.success('create', 'Bank Deposit');
      } else {
        NotificationHelper.success('lockBankDeposit');
      }
    } catch (error) {
      const typedError = error as ApiError;

      if (isCreate) {
        NotificationHelper.error(
          'create',
          typedError?.response?.code as ActionCode,
          'Bank Deposit',
        );

        Sentry.addBreadcrumb({
          category: 'BankDeposit',
          message: `Create Deposit Error ${JSON.stringify(typedError?.message)}`,
          data: {
            businessUnitId,
            id,
            date,
          },
        });
      } else {
        NotificationHelper.error('lockBankDeposit', typedError?.response?.code as ActionCode);

        Sentry.addBreadcrumb({
          category: 'BankDeposit',
          message: `Lock Bank Deposit Error ${JSON.stringify(typedError?.message)}`,
          data: {
            businessUnitId,
            id,
            date,
          },
        });
      }

      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async unlockBankDeposit({ id, date }: BankDeposit, businessUnitId: string) {
    try {
      const { unlockBankDeposit } = await task(this.service.unlockBankDeposit(id, businessUnitId));

      const prevLockedDeposit = this.getById(id);

      const prevUnlockedDeposits = this.values.filter(
        bankDeposit =>
          bankDeposit.status === BankDepositStatus.unLocked &&
          bankDeposit.depositType === prevLockedDeposit?.depositType,
      );

      prevUnlockedDeposits.forEach(deposit => {
        deposit.status = BankDepositStatus.locked;
      });

      if (prevLockedDeposit) {
        prevLockedDeposit.status = BankDepositStatus.unLocked;
      }

      if (unlockBankDeposit) {
        NotificationHelper.success('unlockBankDeposit');
      }
    } catch (error) {
      const typedError = error as ApiError;

      NotificationHelper.error('unlockBankDeposit', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BankDeposit',
        message: `Unlock Bank Deposit Error ${JSON.stringify(typedError?.message)}`,
        data: {
          businessUnitId,
          id,
          date,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @action
  checkAll(value: boolean) {
    this.values.forEach(bankDeposit => (bankDeposit.checked = value));
  }

  @computed
  get checkedBankDeposits() {
    return this.values.filter(bankDeposit => bankDeposit.checked);
  }

  @computed
  get isAllChecked() {
    const bankDeposits = this.values;
    const loading = this.loading;

    return (
      this.checkedBankDeposits.length === bankDeposits.length && bankDeposits.length > 0 && !loading
    );
  }
}
