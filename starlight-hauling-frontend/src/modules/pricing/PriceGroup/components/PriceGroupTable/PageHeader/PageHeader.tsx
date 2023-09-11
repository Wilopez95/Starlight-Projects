import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { Protected, Switch } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';

import { PageHeaderProps } from './types';

import styles from './css/styles.scss';

const I18N_PATH =
  'modules.pricing.PriceGroup.components.PriceGroupTable.components.PageHeader.Text.';

// TODO: use PageHeader from config page
const PageHeader: React.FC<PageHeaderProps> = props => {
  const { systemConfigurationStore, priceGroupStoreNew, generalRateStoreNew, customRateStoreNew } =
    useStores();
  const { t } = useTranslation();

  const handleSwitchClick = useCallback(() => {
    systemConfigurationStore.toggleShow();
  }, [systemConfigurationStore]);

  const handleCreationClick = useCallback(() => {
    props.buttonRef.current?.blur();

    systemConfigurationStore.toggleDuplicating(false);
    systemConfigurationStore.toggleCreating();
  }, [props, systemConfigurationStore]);

  const [_, __, canCreatePriceGroups] = useCrudPermissions(
    'configuration/price-groups',
    'price-groups',
  );

  const handleBulkEditClick = useCallback(() => {
    props.buttonRef.current?.blur();

    if (customRateStoreNew.isOpenRatesQuickView) {
      customRateStoreNew.toggleRatesQuickView(false);
    }

    if (generalRateStoreNew.isOpenQuickView) {
      generalRateStoreNew.toggleQuickView(false);
    }

    if (priceGroupStoreNew.isOpenQuickView) {
      priceGroupStoreNew.toggleQuickView(false);
    }

    priceGroupStoreNew.toggleBulkEditQuickView();
  }, [priceGroupStoreNew, generalRateStoreNew, customRateStoreNew, props.buttonRef]);

  return (
    <div className={styles.tableDescriptionContainer}>
      <div className={styles.tableDescriptionTable}>Price Group</div>
      <div
        className={cx(styles.navigationContainer, {
          [styles.disabled]: systemConfigurationStore.isCreating,
        })}
      >
        <Switch
          onChange={handleSwitchClick}
          value={systemConfigurationStore.showInactive}
          labelClass={styles.switchLabel}
          id="pageHeaderSwitch"
          name="pageHeaderSwitch"
        >
          {t(`${I18N_PATH}ShowInactive`)}
        </Switch>
        <span ref={props.buttonRef}>
          <Layouts.Flex alignItems="center">
            <Protected permissions="configuration/price-groups:bulk-update:perform">
              <Button onClick={handleBulkEditClick}>{t(`${I18N_PATH}BulkPriceEdit`)}</Button>
            </Protected>
            {canCreatePriceGroups ? (
              <Layouts.Margin left="3">
                <Button iconLeft={PlusIcon} onClick={handleCreationClick} variant="primary">
                  {t(`${I18N_PATH}AddNewPriceGroup`)}
                </Button>
              </Layouts.Margin>
            ) : null}
          </Layouts.Flex>
        </span>
      </div>
    </div>
  );
};

export default observer(PageHeader);
