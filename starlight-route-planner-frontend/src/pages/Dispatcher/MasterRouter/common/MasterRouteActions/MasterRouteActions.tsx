import React, { useContext } from 'react';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { IDropResult } from '@root/common/DragNDropList/types';
import { MasterRouteStatus, RouteType } from '@root/consts';
import { NotificationHelper, validateLineOfBusiness, validateServiceDays } from '@root/helpers';
import { usePromisifiedModalHandlers, useStores, useUserContext } from '@root/hooks';
import {
  IHandleRouteStatus,
  IHaulingServiceItem,
  IMasterRouteEditModeNotice,
  IMasterRouteValidationModalData,
  INoAssignedDriverTruckNotice,
  IUnpublishMasterRouteNotice,
} from '@root/types';
import { PublishRouteFormValues } from '@root/widgets/forms/PublishRouteForm/formikData';
import {
  EditingRouteNoticeModal,
  HandleRouteStatus,
  MasterRouteValidationModal,
  NoAssignedTruckDriverModal,
  PublishRouteModal,
  UnpublishRouteModal,
} from '@root/widgets/modals';

import {
  ActionsParams,
  CheckValidDndParamsType,
  IMasterRouteActions,
  ValidationMessageKeys,
} from './types';

const MasterRouteActionsContext = React.createContext<IMasterRouteActions>({
  triggerEdit: async () => {},
  triggerPublish: async () => {},
  triggerUnpublish: async () => {},
  checkIfValidDnd: () => {},
  checkIfCanUpdate: async () => {},
});

const { Provider } = MasterRouteActionsContext;

export const useMasterRouteActionsContext = () => useContext(MasterRouteActionsContext);

export const MasterRouteController: React.FC = ({ children }) => {
  const { masterRoutesStore, businessLineStore, haulingServiceItemStore } = useStores();
  const { currentUser } = useUserContext();

  const handleStatusData = usePromisifiedModalHandlers<IHandleRouteStatus>();
  const editData = usePromisifiedModalHandlers<IMasterRouteEditModeNotice>();
  const unpublishData = usePromisifiedModalHandlers<IUnpublishMasterRouteNotice>();
  const publishData = usePromisifiedModalHandlers<
    Record<string, string | number>,
    PublishRouteFormValues
  >();
  const noAssignedTruckDriver = usePromisifiedModalHandlers<INoAssignedDriverTruckNotice>();
  const masterRouteValidationModalData =
    usePromisifiedModalHandlers<IMasterRouteValidationModalData>();

  const handleEnterEdit = async (args: ActionsParams) => {
    const enterEditResult = await masterRoutesStore.enableEditMode(args.id);

    if (enterEditResult) {
      const { editorId } = enterEditResult;

      if (editorId === currentUser?.id) {
        return true;
      }

      return editData.handleOpen(enterEditResult);
    }

    return true;
  };

  const handleTryUnpublish = async (args: ActionsParams) => {
    const masterRoute = await masterRoutesStore.fetchMasterRouteById(args.id);

    const { editorId } = masterRoute ?? {};

    if (editorId === currentUser?.id) {
      return true;
    }

    let unpublishValidationResult;

    // Case when user dnd to enable edit mode
    if (masterRoute?.status !== MasterRouteStatus.ACTIVE && args.markerType) {
      // Handle single popup
      if (masterRoute?.name) {
        // We don`t have editing status on UI
        const status =
          masterRoute.status === MasterRouteStatus.EDITING
            ? MasterRouteStatus.UPDATING
            : masterRoute.status;

        handleStatusData.handleOpen({
          routeName: masterRoute.name,
          routeStatus: status ?? '',
        });
      }

      // If route status is not active we can exit all enterEditFlow
      throw new Error('Route status is not active');
    }

    if (masterRoute?.published) {
      unpublishValidationResult = await masterRoutesStore.unpublishMasterRoute(args.id, false);
    }

    if (unpublishValidationResult) {
      return unpublishData.handleOpen(unpublishValidationResult);
    }

    return true;
  };

  const handleForceUnpublish = async () => {
    await masterRoutesStore.unpublishMasterRoute(unpublishData.modalData?.id as number, true);

    await unpublishData.handleSubmit();
  };

  const handlePublish = async (route?: ActionsParams) => {
    if (!route?.truckId) {
      return noAssignedTruckDriver.handleOpen({
        type: 'truck',
      });
    }

    if (!route.driverId) {
      return noAssignedTruckDriver.handleOpen({
        type: 'driver',
      });
    }

    publishData.handleOpen({ id: route.id });
  };

  const onPublish = async (dataToPublish: Record<string, string | number>) => {
    const { id, publishDate } = dataToPublish;

    const publisDateTime = new Date(publishDate);

    await masterRoutesStore.publishMasterRoute({
      id: id as number,
      publishDate: publisDateTime,
    });
  };

  const checkIfCanUpdate = async (id: number) => {
    const masterRoute = await masterRoutesStore.fetchMasterRouteById(id);

    const canNotUpdate =
      masterRoute?.published ?? masterRoute?.status === MasterRouteStatus.UPDATING;

    if (canNotUpdate) {
      NotificationHelper.error('updateMasterRoute', 'INVALID_REQUEST');

      throw new Error(`Can't update route, because route in status ${MasterRouteStatus.UPDATING}`);
    }
  };

  const checkIfCanPublish = async (id: number) => {
    const masterRoute = await masterRoutesStore.fetchMasterRouteById(id);

    if (masterRoute === undefined) {
      throw new Error(
        `Can't publish route, because master route is not defined ${MasterRouteStatus.UPDATING}`,
      );
    }

    const canNotPublish =
      masterRoute.published ||
      masterRoute.status === MasterRouteStatus.UPDATING ||
      masterRoute.status === MasterRouteStatus.EDITING;

    if (canNotPublish) {
      if (masterRoute.status === MasterRouteStatus.EDITING) {
        editData.handleOpen({
          currentlyEditingBy: masterRoute.editingBy ?? '',
          message: '',
          editorId: masterRoute.editorId ?? '',
        });
      } else {
        NotificationHelper.error('publishMasterRoute', 'UNKNOWN');
      }

      throw new Error(`Can't publish route, because route in status ${MasterRouteStatus.UPDATING}`);
    }
  };

  const enterEditFlow = async (args: ActionsParams) => {
    try {
      await handleTryUnpublish(args);
      await handleEnterEdit(args);

      masterRoutesStore.toggleMasterRouteModalSettings({
        visible: true,
        id: args.id,
        activeTabIndex: 1,
        pinData: args as IDropResult,
      });
    } catch (e) {
      noop(e);
    }
  };

  const unpublishFlow = async (args: ActionsParams) => {
    try {
      await handleTryUnpublish(args);
    } catch (e) {
      noop(e);
    }
  };

  const publishFlow = async (args: ActionsParams) => {
    try {
      await checkIfCanPublish(args.id);
      await handlePublish(args);
    } catch (e) {
      noop(e);
    }
  };

  const checkIfValidDnd = (args: CheckValidDndParamsType) => {
    try {
      const serviceItemsToSet = args.ids.reduce<IHaulingServiceItem[]>((acc, id) => {
        const exists = args.serviceItems.find(serviceItem => serviceItem.id === id);

        if (exists) {
          return acc;
        }

        const haulingServiceItem = haulingServiceItemStore.getById(id);

        if (haulingServiceItem) {
          acc.push(haulingServiceItem);
        }

        return acc;
      }, []);

      const invalidLOB = validateLineOfBusiness({
        presentItems: args.serviceItems,
        droppedItems: serviceItemsToSet,
        businessLineStore,
      });

      if (!isEmpty(invalidLOB)) {
        masterRouteValidationModalData.handleOpen({
          routeName: args.routeName,
          items: invalidLOB,
          validationKey: ValidationMessageKeys.BusinessLine,
        });

        return false;
      }

      const invalidDays = validateServiceDays({
        droppedItems: serviceItemsToSet,
        serviceDays: args.serviceDaysList,
      });

      if (!isEmpty(invalidDays)) {
        masterRouteValidationModalData.handleOpen({
          routeName: args.routeName,
          items: invalidDays,
          validationKey: ValidationMessageKeys.ServiceDays,
        });

        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  };

  const routeActions: IMasterRouteActions = {
    triggerEdit: enterEditFlow,
    triggerUnpublish: unpublishFlow,
    triggerPublish: publishFlow,
    checkIfValidDnd,
    checkIfCanUpdate,
  };

  return (
    <Provider value={routeActions}>
      <PublishRouteModal
        isOpen={!!publishData.modalData}
        onClose={publishData.handleClose}
        onPublish={data => publishData.handleSubmit(onPublish, data)}
      />
      <UnpublishRouteModal
        isOpen={!!unpublishData.modalData}
        unpublishInfo={unpublishData.modalData}
        onClose={unpublishData.handleClose}
        onUnpublish={() => unpublishData.handleSubmit(handleForceUnpublish)}
      />
      <EditingRouteNoticeModal
        isOpen={!!editData.modalData}
        routeType={RouteType.MasterRoute}
        editingInfo={editData.modalData}
        onClose={editData.handleClose}
      />
      <HandleRouteStatus
        isOpen={!!handleStatusData.modalData}
        data={handleStatusData.modalData as IHandleRouteStatus}
        onSubmit={handleStatusData.handleClose}
      />
      <NoAssignedTruckDriverModal
        isOpen={!!noAssignedTruckDriver.modalData}
        type={noAssignedTruckDriver.modalData?.type as INoAssignedDriverTruckNotice['type']}
        onClose={noAssignedTruckDriver.handleClose}
      />
      {masterRouteValidationModalData.modalData && (
        <MasterRouteValidationModal
          onClose={masterRouteValidationModalData.handleClose}
          items={masterRouteValidationModalData.modalData.items}
          routeName={masterRouteValidationModalData.modalData.routeName}
          validationMessageKey={masterRouteValidationModalData.modalData.validationKey}
        />
      )}
      {children}
    </Provider>
  );
};

export default observer(MasterRouteController);
