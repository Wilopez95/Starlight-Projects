import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { IWeightTicketRequestParams } from '@root/stores/WeightTicketStore/types';

import { WeightTicketForm } from './WeightTicketForm/WeightTicketForm';
import { Modal } from './styles';

interface IProps {
  weightTicketNumberList: string[];
  onSubmit(dailyRouteId: number, weightTicket: IWeightTicketRequestParams): void;
}

export const WeightTicketFormModal: React.FC<IProps> = observer(
  ({ weightTicketNumberList, onSubmit }) => {
    const { dashboardStore } = useStores();
    const { visible, dailyRouteId, isEdit, weightTicket, materialIds } =
      dashboardStore.weightTicketModalSettings;

    const handleWeightTicketModalClose = useCallback(() => {
      dashboardStore.toggleWeightTicketModal({
        isEdit: false,
        visible: false,
        dailyRouteId: undefined,
        weightTicket: undefined,
        materialIds: undefined,
      });
    }, [dashboardStore]);

    return (
      <Modal isOpen={visible} onClose={handleWeightTicketModalClose}>
        <WeightTicketForm
          weightTicket={weightTicket}
          dailyRouteId={dailyRouteId}
          materialIds={materialIds}
          isEdit={isEdit}
          weightTicketNumberList={weightTicketNumberList}
          onClose={handleWeightTicketModalClose}
          onSubmit={onSubmit}
        />
      </Modal>
    );
  },
);
