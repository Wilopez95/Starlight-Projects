import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';

import { RouteType } from '@root/consts';
import { usePromisifiedModalHandlers, useStores, useUserContext } from '@root/hooks';
import { IDailyRoute, IDailyRouteEditModeNotice } from '@root/types';
import { EditingRouteNoticeModal } from '@root/widgets/modals';

import { IDailyRouteActions } from './types';

const DailyRouteActionsContext = React.createContext<IDailyRouteActions>({
  triggerEdit: () => Promise.resolve({ isValid: false }),
});

const { Provider } = DailyRouteActionsContext;

export const useDailyRouteActionsContext = () => useContext(DailyRouteActionsContext);

export const DailyRouteController: React.FC = ({ children }) => {
  const { dailyRoutesStore } = useStores();
  const { currentUser } = useUserContext();

  const editData = usePromisifiedModalHandlers<IDailyRouteEditModeNotice>();

  const handleEnterEdit = async (route?: IDailyRoute) => {
    const enterEditResult = await dailyRoutesStore.enableEditMode(route?.id as number);

    if (enterEditResult) {
      const { editorId } = enterEditResult;

      if (editorId === currentUser?.id) {
        return true;
      }

      return editData.handleOpen(enterEditResult);
    }

    return true;
  };

  const enterEditFlow = async (args: IDailyRoute) => {
    try {
      const isValid = await handleEnterEdit(args);

      return { isValid };
    } catch (e) {
      return { isValid: false };
    }
  };

  const routeActions: IDailyRouteActions = {
    triggerEdit: enterEditFlow,
  };

  return (
    <Provider value={routeActions}>
      <EditingRouteNoticeModal
        isOpen={!!editData.modalData}
        routeType={RouteType.DailyRoute}
        editingInfo={editData.modalData}
        onClose={editData.handleClose}
      />
      {children}
    </Provider>
  );
};

export default observer(DailyRouteController);
