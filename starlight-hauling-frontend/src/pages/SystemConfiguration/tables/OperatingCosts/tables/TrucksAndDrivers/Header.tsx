import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, PlusIcon, Switch } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useStores } from '@root/hooks';

import { ITrucksAndDriversHeader } from './types';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.Text.';
const I18N_PATH_COST = 'pages.SystemConfiguration.tables.OperatingCosts.Text.';

const TrucksAndDriversHeader: React.FC<ITrucksAndDriversHeader> = ({
  buttonRef,
  canCreateOperatingCosts,
}) => {
  const { t } = useTranslation();
  const { truckAndDriverCostStore, systemConfigurationStore } = useStores();

  const handleChangeInactive = useCallback(() => {
    systemConfigurationStore.toggleShow();
  }, [systemConfigurationStore]);

  const handleAddNewTruckAndDriverCosts = useCallback(() => {
    systemConfigurationStore.toggleCreating(true);
    truckAndDriverCostStore.unSelectEntity();
  }, [systemConfigurationStore, truckAndDriverCostStore]);

  return (
    <Layouts.Padding top="2" bottom="2.5">
      <Layouts.Box as={Layouts.Flex} justifyContent="space-between">
        <Typography as="h1" variant="headerTwo" fontWeight="bold">
          {t(`${I18N_PATH_COST}OperatingCosts`)}
        </Typography>
        {canCreateOperatingCosts ? (
          <Layouts.Flex alignItems="center">
            <Switch
              onChange={handleChangeInactive}
              value={systemConfigurationStore.showInactive}
              id="pageHeaderSwitch"
              name="pageHeaderSwitch"
            >
              {t(`${I18N_PATH}ShowInactive`)}
            </Switch>
            <Layouts.Margin left="3">
              <Button
                iconLeft={PlusIcon}
                variant="primary"
                buttonRef={buttonRef}
                onClick={handleAddNewTruckAndDriverCosts}
              >
                {t(`${I18N_PATH}NewTrucksAndDriversCosts`)}
              </Button>
            </Layouts.Margin>
          </Layouts.Flex>
        ) : null}
      </Layouts.Box>
    </Layouts.Padding>
  );
};

export default observer(TrucksAndDriversHeader);
