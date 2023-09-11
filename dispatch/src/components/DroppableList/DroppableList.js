import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useContextMenu } from 'react-contexify';
import ContextMenu from '@root/components/ContextMenu';
import WorkOrderListItem from '@root/components/WorkOrderListItem';
import constants from '@root/helpers/constants.json';

const { orderConfigs } = constants;

const DroppableList = ({
  workOrders = [],
  waypoints,
  force,
  unpublishedChanges,
  onUpdateSingleWorkOrder,
  onUpdateSingleWorkOrderWDriver,
  onCreateWorkOrder,
  drivers,
  manageWoPollingInterval,
  isListItem,
  isUpdating,
  history,
  isSuspended,
}) => {
  const { show, hideAll } = useContextMenu();
  const updatePolling = (enable) => {
    manageWoPollingInterval(enable);
  };
  const onShown = () => {
    const listview = document.getElementById('listview');
    const onScroll = () => {
      hideAll();
      listview.removeEventListener('scroll', onScroll);
    };
    listview.addEventListener('scroll', onScroll);
  };
  const handleContextMenu = (event) => {
    event.preventDefault();
    show(event, { id: event.currentTarget.dataset.menu });
  };

  return workOrders.map((workOrder, index) => {
    const orderConfig = orderConfigs.filter(
      (config) => config.name.toLowerCase() === workOrder.action.toLowerCase(),
    )[0];
    return (
      <Fragment key={`workOrderListItem${workOrder.id.toString()}`}>
        <div onContextMenu={handleContextMenu} data-menu={`${workOrder.id.toString()}-droplist`}>
          <WorkOrderListItem
            id={
              isSuspended
                ? `workOrderListItem-suspended-${workOrder.id}`
                : `workOrderListItem-unassigned-${workOrder.id}`
            }
            force={force}
            drivers={drivers}
            workOrder={workOrder}
            workOrders={workOrders}
            orderConfig={orderConfig}
            manageWoPollingInterval={updatePolling}
            unpublishedChanges={unpublishedChanges}
            index={index}
            isListItem={isListItem}
            isSuspended={isSuspended}
          />
        </div>
        <ContextMenu
          driver={{ id: null }}
          waypoints={waypoints}
          workOrder={workOrder}
          menuId={`${workOrder.id.toString()}-droplist`}
          force={force}
          unpublishedChanges={unpublishedChanges}
          isUpdating={isUpdating}
          onUpdateSingleWorkOrder={onUpdateSingleWorkOrder}
          onUpdateSingleWorkOrderWDriver={onUpdateSingleWorkOrderWDriver}
          onCreateWorkOrder={onCreateWorkOrder}
          onShown={onShown}
          showSelectLandfill={
            orderConfig.puzzlePositions.bottom || orderConfig.name === 'dump & return'
          }
          showCreatePickup={
            (orderConfig.puzzlePositions.top &&
              workOrder.status !== 'UNASSIGNED' &&
              orderConfig.name === 'dump & return') ||
            orderConfig.name === 'live load' ||
            orderConfig.name === 'switch' ||
            orderConfig.name === 'spot'
          }
          showCreateDropoff={
            (orderConfig.puzzlePositions.bottom &&
              workOrder.status !== 'UNASSIGNED' &&
              orderConfig.name === 'dump & return') ||
            orderConfig.name === 'live load' ||
            orderConfig.name === 'switch' ||
            orderConfig.name === 'final'
          }
          history={history}
        />
      </Fragment>
    );
  });
};

DroppableList.propTypes = {
  workOrders: PropTypes.array.isRequired,
  waypoints: PropTypes.array.isRequired,
  force: PropTypes.func.isRequired,
  unpublishedChanges: PropTypes.number.isRequired,
  isUpdating: PropTypes.bool,
  onUpdateSingleWorkOrder: PropTypes.func.isRequired,
  onUpdateSingleWorkOrderWDriver: PropTypes.func.isRequired,
  onCreateWorkOrder: PropTypes.func.isRequired,
  manageWoPollingInterval: PropTypes.func.isRequired,
};

export default DroppableList;
