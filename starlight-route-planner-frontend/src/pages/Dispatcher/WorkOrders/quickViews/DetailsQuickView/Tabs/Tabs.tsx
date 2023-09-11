import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, NavigationConfigItem } from '@starlightpro/shared-components';

import { CommentsTab } from './CommentsTab/CommentsTab';
import { DetailsTab } from './Details';
import HistoryTab from './History';
import { JobSiteTab } from './JobSite';
import { Navigation } from './styles';
import { ITabs } from './types';

export type TabsConfigType = 'details' | 'jobSite' | 'comments' | 'history';

const I18N_PATH = 'quickViews.WorkOrderView.Text.';

const tabs = {
  details: DetailsTab,
  jobSite: JobSiteTab,
  comments: CommentsTab,
  history: HistoryTab,
};

export const Tabs: React.FC<ITabs> = ({ workOrder, scrollContainerHeight, onAddRef, onEdit }) => {
  const { t } = useTranslation();

  const tabsConfig: NavigationConfigItem<TabsConfigType>[] = useMemo(() => {
    return [
      {
        label: t(`${I18N_PATH}TabDetailsTitle`),
        key: 'details',
        index: 0,
      },
      {
        label: t(`${I18N_PATH}TabJobSiteTitle`),
        key: 'jobSite',
        index: 1,
      },
      {
        label: t(`${I18N_PATH}TabCommentsTitle`),
        key: 'comments',
        index: 2,
      },
      {
        label: t(`${I18N_PATH}TabHistoryTitle`),
        key: 'history',
        index: 3,
      },
    ];
  }, [t]);

  const [activeTab, setActiveTab] = useState<NavigationConfigItem<TabsConfigType>>(tabsConfig[0]);

  const CurrentTab = tabs[activeTab.key];

  const onTabChange = (tab: NavigationConfigItem<TabsConfigType>) => {
    setActiveTab(tab);
  };

  return (
    <>
      <Navigation
        ref={onAddRef}
        activeTab={activeTab}
        configs={tabsConfig}
        onChange={onTabChange}
        border
      />
      <Layouts.Scroll height={scrollContainerHeight}>
        <Layouts.Padding bottom="2" left="3" right="3">
          <CurrentTab
            workOrder={workOrder}
            onEdit={onEdit}
            onAddRef={onAddRef}
            scrollContainerHeight={scrollContainerHeight}
          />
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};
