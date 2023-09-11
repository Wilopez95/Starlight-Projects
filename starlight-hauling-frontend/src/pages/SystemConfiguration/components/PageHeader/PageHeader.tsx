import React, { useCallback } from 'react';
import { Button } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { Switch, Typography } from '@root/common';
import { useStores } from '@root/hooks';

import { PageHeaderProps } from './types';

import styles from './css/styles.scss';

const PageHeader: React.FC<PageHeaderProps> = props => {
  const { systemConfigurationStore } = useStores();

  const handleSwitchClick = useCallback(() => {
    systemConfigurationStore.toggleShow();
  }, [systemConfigurationStore]);

  const handleCreationClick = useCallback(() => {
    if (!props.hideActions) {
      props.buttonRef?.current?.blur();
    }

    systemConfigurationStore.toggleDuplicating(false);
    systemConfigurationStore.toggleCreating();
  }, [props, systemConfigurationStore]);

  return (
    <div className={styles.tableDescriptionContainer}>
      <Typography as="h1" className={styles.tableDescriptionTable}>
        {props.title}
      </Typography>
      {!props.hideActions ? (
        <div
          className={cx(styles.navigationContainer, {
            [styles.disabled]: systemConfigurationStore.isCreating,
          })}
        >
          {!props.hideSwitch ? (
            <Switch
              onChange={handleSwitchClick}
              value={systemConfigurationStore.showInactive}
              labelClass={styles.switchLabel}
              id="pageHeaderSwitch"
              name="pageHeaderSwitch"
            >
              Show Inactive
            </Switch>
          ) : null}
          {props.button ? (
            <Button
              iconLeft={PlusIcon}
              onClick={handleCreationClick}
              buttonRef={props.buttonRef}
              variant="primary"
            >
              {props.button}
            </Button>
          ) : null}
          {props.children}
        </div>
      ) : null}
    </div>
  );
};

export default observer(PageHeader);
