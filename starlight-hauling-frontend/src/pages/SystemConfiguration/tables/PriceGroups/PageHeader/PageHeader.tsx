import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { Protected, Switch } from '@root/common';
import { useCrudPermissions, useStores } from '@root/hooks';

import { PageHeaderProps } from './types';

import styles from './css/styles.scss';

// TODO: use PageHeader from config page
const PageHeader: React.FC<PageHeaderProps> = props => {
  const { systemConfigurationStore, priceGroupStore, globalRateStore } = useStores();

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

    if (priceGroupStore.isOpenRatesQuickView) {
      priceGroupStore.toggleRatesQuickView(false);
    }

    if (globalRateStore.isOpenQuickView) {
      globalRateStore.toggleQuickView(false);
    }

    if (priceGroupStore.isOpenQuickView) {
      priceGroupStore.toggleQuickView(false);
    }

    priceGroupStore.toggleBulkEditQuickView();
  }, [priceGroupStore, globalRateStore, props.buttonRef]);

  return (
    <div className={styles.tableDescriptionContainer}>
      <h1 className={styles.tableDescriptionTable}>Price Groups</h1>
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
          Show Inactive
        </Switch>
        <span ref={props.buttonRef}>
          <Layouts.Flex alignItems="center">
            <Protected permissions="configuration/price-groups:bulk-update:perform">
              <Button onClick={handleBulkEditClick}>Bulk Pricing Edit</Button>
            </Protected>
            {canCreatePriceGroups ? (
              <Layouts.Margin left="3">
                <Button iconLeft={PlusIcon} onClick={handleCreationClick} variant="primary">
                  Add New Price Group
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
