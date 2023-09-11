import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';
import { IWorkOrder } from '@root/types';

import { Form } from './Form';

interface IProps {
  workOrder: IWorkOrder;
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  onClose(workOrder?: IWorkOrder): void;
}

export const EditQuickView: React.FC<IProps> = observer(
  ({ onClose, mainContainerRef, workOrder }) => {
    const { workOrdersStore } = useStores();

    return (
      <QuickView
        condition={workOrdersStore.workOrderEditQuickViewVisible}
        clickOutHandler={onClose}
        parentRef={mainContainerRef}
        id="edit-quickview"
      >
        {({ onAddRef, scrollContainerHeight }) => (
          <Form
            onAddRef={onAddRef}
            scrollContainerHeight={scrollContainerHeight}
            onClose={onClose}
            workOrder={workOrder}
          />
        )}
      </QuickView>
    );
  },
);
