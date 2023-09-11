import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { BusinessUnitService } from '../../../../../api';
import { PlusIcon } from '../../../../../assets';
import { Protected, RangeCalendar, Typography } from '../../../../../common';
import { ConfirmModal } from '../../../../../components/modals';
import { convertDates } from '../../../../../helpers';
import { useBusinessContext, useStores, useToggle } from '../../../../../hooks';
import { IMerchant } from '../../../../../types';
import { SettlementService } from '../../api/settlement';
import RequestSettlementModal from '../RequestSettlement/RequestSettlement';

import { IPageHeader } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'modules.billing.Settlements.components.PageHeader.Text.';

const PageHeader: React.FC<IPageHeader> = ({ rangeCalendarProps }) => {
  const { settlementStore } = useStores();
  const [isModalOpen, toggleModal] = useToggle(false);
  const [isConfirmModalOpen, toggleConfirmModal] = useToggle(false);

  const { businessUnitId } = useBusinessContext();

  const [availableMerchants, setMerchants] = useState<IMerchant[]>([]);

  const { t } = useTranslation();

  const checkedSettlements = settlementStore.checkedSettlements.length;

  useEffect(() => {
    (async () => {
      const merchants = await BusinessUnitService.getAvailableMerchants(+businessUnitId);

      setMerchants(merchants.map(convertDates));
    })();
  }, [businessUnitId]);

  const handleSettlementsDelete = useCallback(async () => {
    await settlementStore.deleteSettlements(settlementStore.checkedSettlements.map(({ id }) => id));
    toggleConfirmModal();
  }, [settlementStore, toggleConfirmModal]);

  const handleSettlementsDownload = useCallback(() => {
    const settlementQueryParams = new URLSearchParams();
    const settlementIds =
      checkedSettlements > 0
        ? settlementStore.checkedSettlements.map(settlement => settlement.id)
        : settlementStore.values.map(settlement => settlement.id);

    settlementIds.forEach(id => settlementQueryParams.append('settlementIds', id.toString()));

    SettlementService.downloadSettlements(settlementQueryParams.toString());
  }, [checkedSettlements, settlementStore.checkedSettlements, settlementStore.values]);

  return (
    <Layouts.Margin bottom="2">
      <Layouts.Flex justifyContent="space-between" alignItems="center">
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          cancelButton={t('Text.Cancel')}
          submitButton={t(`${I18N_PATH}DeleteButton`)}
          title={t(`${I18N_PATH}DeleteSettlementsHeader`)}
          subTitle={t(`${I18N_PATH}DeleteSettlementsBody`)}
          className={styles.modal}
          onCancel={toggleConfirmModal}
          onSubmit={handleSettlementsDelete}
        />
        {isModalOpen ? (
          <RequestSettlementModal
            businessUnitId={+businessUnitId}
            availableMerchants={availableMerchants}
            isOpen={isModalOpen}
            onClose={toggleModal}
          />
        ) : null}
        <Layouts.Flex alignItems="center" justifyContent="flex-start">
          {checkedSettlements === 0 ? (
            <>
              <Layouts.Margin right="3">
                <Typography as="h1" variant="headerTwo">
                  Credit Card Settlements
                </Typography>
              </Layouts.Margin>
              <Layouts.Margin right="3">
                <Typography
                  as="label"
                  htmlFor="RangeInvoicesDate"
                  variant="bodyMedium"
                  color="secondary"
                  shade="light"
                >
                  for
                </Typography>
              </Layouts.Margin>
              <div className={styles.container}>
                <RangeCalendar
                  name="RangeInvoicesDate"
                  noError
                  wrapperClassName={styles.range}
                  maxDate={new Date()}
                  calendarProps={rangeCalendarProps}
                />
              </div>
              {settlementStore.count !== undefined ? (
                <Layouts.Margin left="3">
                  <Typography variant="bodyMedium">
                    {settlementStore.values.length} of {settlementStore.count}
                  </Typography>
                </Layouts.Margin>
              ) : null}
            </>
          ) : (
            <Typography variant="headerTwo">{checkedSettlements} Settlement(s) selected</Typography>
          )}
        </Layouts.Flex>
        <Layouts.Flex>
          {checkedSettlements > 0 ? (
            <Layouts.Margin>
              <Button variant="converseAlert" onClick={toggleConfirmModal}>
                Delete Selected
              </Button>
            </Layouts.Margin>
          ) : null}
          <Protected permissions="billing:settlements:full-access">
            <Layouts.Margin left="3">
              <Button onClick={handleSettlementsDownload}>
                {checkedSettlements === 0 ? 'Print All Settlements' : 'Print Selected Settlements'}
              </Button>
            </Layouts.Margin>
            <Layouts.Margin left="3">
              <Button iconLeft={PlusIcon} variant="primary" onClick={toggleModal}>
                Request Settlement
              </Button>
            </Layouts.Margin>
          </Protected>
        </Layouts.Flex>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(PageHeader);
