import React from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';

import { Form } from './Form';

interface ICUDailyRouteForm {
  onClose: () => void;
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const DailyRouteForm: React.FC<ICUDailyRouteForm> = ({ mainContainerRef, onClose }) => {
  const { dailyRoutesStore } = useStores();

  const disableEditMode = () =>
    dailyRoutesStore.disableEditMode(dailyRoutesStore.dailyRouteModalSettings.id);

  const onClickOutHandler = async () => {
    await disableEditMode();
    onClose();
  };

  useBeforeunload(() => {
    disableEditMode();
  });

  return (
    <QuickView
      condition={!!dailyRoutesStore.dailyRouteModalSettings.visible}
      clickOutHandler={onClickOutHandler}
      parentRef={mainContainerRef}
      clickOutSelectors={['#daily-routes-map']}
    >
      {({ onAddRef, scrollContainerHeight }) => (
        <Form onAddRef={onAddRef} scrollContainerHeight={scrollContainerHeight} onClose={onClose} />
      )}
    </QuickView>
  );
};

export default observer(DailyRouteForm);
