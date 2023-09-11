import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { toUpper } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { CustomerOwnedEquipmentAllowedActions } from '@root/consts';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IBillableService, ILineItem } from '@root/types';

import { BillableOneTimeServiceQuickViewForm } from './forms/BillableOneTimeServiceForm/BillableOneTimeServiceForm';
import { BillableRecurringServiceQuickViewForm } from './forms/BillableRecurringServiceForm/BillableRecurringServiceForm';
import { OneTimeLineItemQuickViewForm } from './forms/OneTimeLineItemForm/OneTimeLineItemForm';
import { RecurringLineItemQuickViewForm } from './forms/RecurringLineItemForm/RecurringLineItemForm';
import { SurchargeQuickViewForm } from './forms/SurchargeForm/SurchargeForm';
import { ThresholdQuickViewForm } from './forms/ThresholdForm/ThresholdForm';
import { BillableItemType, IBillableItemQuickView } from './types';

import styles from './css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.QuickView.BillableItemsQuickView.',
);

const BillableItemsQuickViewRightPanel: React.FC<IBillableItemQuickView> = ({
  store,
  selectedTab,
  quickViewSubtitle,
}) => {
  const { t } = useTranslation();
  const { equipmentItemStore, systemConfigurationStore } = useStores();

  const selectedBillableItem = store.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedBillableItem;

  const { values } = useFormikContext<IBillableService>();

  const billableServiceAction = values.action;

  const equipmentItemsOptions = useMemo(() => {
    const action =
      selectedTab === 'service' || selectedTab === 'recurring' ? billableServiceAction : undefined;
    const shouldFilterCOEOut = action && !CustomerOwnedEquipmentAllowedActions.includes(action);

    return equipmentItemStore.values
      .filter(equipment => (shouldFilterCOEOut ? !equipment.customerOwned : true))
      .map(equipmentItem => ({
        label: equipmentItem.description,
        value: equipmentItem.id,
        COEHint: equipmentItem.customerOwned,
      }));
  }, [equipmentItemStore.values, selectedTab, billableServiceAction]);

  const isTripCharge =
    selectedTab === BillableItemType.lineItem && (values as ILineItem).type === 'tripCharge';

  const form = useMemo(() => {
    switch (selectedTab) {
      case BillableItemType.lineItem:
        return <OneTimeLineItemQuickViewForm isTripCharge={isTripCharge} />;
      case BillableItemType.recurringLineItem:
        return <RecurringLineItemQuickViewForm />;
      case BillableItemType.service:
        return <BillableOneTimeServiceQuickViewForm equipmentItemOptions={equipmentItemsOptions} />;
      case BillableItemType.recurringService:
        return (
          <BillableRecurringServiceQuickViewForm equipmentItemOptions={equipmentItemsOptions} />
        );
      case BillableItemType.threshold:
        return <ThresholdQuickViewForm />;
      case BillableItemType.surcharge:
        return <SurchargeQuickViewForm />;
      default:
        return null;
    }
  }, [equipmentItemsOptions, isTripCharge, selectedTab]);

  const title =
    isNew || !values.description ? t(`${I18N_PATH.Text}CreateNewBillableItem`) : values.description;

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{title}</Typography>
        <Typography shade="light" variant="caption" textTransform="uppercase">
          {toUpper(quickViewSubtitle)}
        </Typography>
        <Divider both />
        <div className={styles.formContainer}>
          <Table>{form}</Table>
        </div>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(BillableItemsQuickViewRightPanel);
