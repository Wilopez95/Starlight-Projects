import React from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';

import { Form } from './Form';

interface IProps {
  onClose(): void;
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const EditQuickView: React.FC<IProps> = observer(({ onClose, mainContainerRef }) => {
  const { dashboardStore, dailyRoutesStore } = useStores();
  const route = dashboardStore.getDailyRouteByQuickViewSettings;

  const disableEditMode = () =>
    dailyRoutesStore.disableEditMode(dashboardStore.quickViewSettings.id);

  useBeforeunload(() => {
    disableEditMode();
  });

  if (!route) {
    return null;
  }

  return (
    <QuickView
      condition={dashboardStore.quickViewSettings.visible}
      loading={dashboardStore.quickViewLoading}
      clickOutHandler={onClose}
      clickOutSelectors={['.flatpickr-calendar']}
      parentRef={mainContainerRef}
      id="edit-quickview"
    >
      {({ onAddRef, scrollContainerHeight }) => (
        <Form
          onAddRef={onAddRef}
          scrollContainerHeight={scrollContainerHeight}
          onClose={onClose}
          dailyRoute={route}
        />
      )}
    </QuickView>
  );
});
