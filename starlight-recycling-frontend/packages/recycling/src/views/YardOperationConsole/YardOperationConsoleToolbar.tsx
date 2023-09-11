import React, { FC } from 'react';
import { makeStyles, Tab, Tabs } from '@material-ui/core';
import { useTranslation } from '../../i18n';

import { YardOperationConsoleTabs } from './constants';
import { GetOrdersIndexedWithYardConsoleAggregationQuery } from '../../graphql/api';

const useStyles = makeStyles(
  () => ({
    tabsRoot: {
      flex: '4 1 auto',
    },
  }),
  { name: 'YardOperationConsoleToolbar' },
);

interface Props {
  consoleActivity:
    | GetOrdersIndexedWithYardConsoleAggregationQuery['yardOperationConsoleActivity']
    | undefined;
  activeTab: YardOperationConsoleTabs;
  onTabChange: (tab: YardOperationConsoleTabs) => void;
}

export const YardOperationConsoleToolbar: FC<Props> = ({
  consoleActivity,
  activeTab,
  onTabChange,
}) => {
  const [t] = useTranslation();
  const classes = useStyles();

  return (
    <Tabs
      value={activeTab}
      indicatorColor="primary"
      onChange={(e, tab) => onTabChange(tab)}
      aria-label="tabs"
      className={classes.tabsRoot}
    >
      <Tab
        label={`${t('Today')} · ${consoleActivity?.today || 0}`}
        id={YardOperationConsoleTabs.Today}
        value={YardOperationConsoleTabs.Today}
      />
      <Tab
        label={`${t('In Yard')} · ${consoleActivity?.inYard || 0}`}
        id={YardOperationConsoleTabs.InYard}
        value={YardOperationConsoleTabs.InYard}
      />
      <Tab
        label={`${t('On the Way')} · ${consoleActivity?.onTheWay || 0}`}
        id={YardOperationConsoleTabs.OnTheWay}
        value={YardOperationConsoleTabs.OnTheWay}
      />
      <Tab
        label={`${t('Self Service')} · ${consoleActivity?.selfService || 0}`}
        id={YardOperationConsoleTabs.SelfService}
        value={YardOperationConsoleTabs.SelfService}
      />
    </Tabs>
  );
};
