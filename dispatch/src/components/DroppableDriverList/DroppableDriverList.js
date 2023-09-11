import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useContextMenu } from 'react-contexify';
import WorkOrderListItem from '@root/components/WorkOrderListItem';
import ContextMenu from '@root/components/ContextMenu';
import constants from '@root/helpers/constants.json';

const { orderConfigs } = constants;

const DroppableDriverList = ({
  driver,
  force,
  workOrders,
  waypoints,
  unpublishedChanges,
  onUpdateSingleWorkOrder,
  onUpdateSingleWorkOrderWDriver,
  onCreateWorkOrder,
  drivers,
  manageWoPollingInterval,
  isListItem,
  isUpdating,
  history,
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

  return (
    <div className="driverOrders" id={`driverOrders${driver.id}`} style={{ marginBottom: '35px' }}>
      {workOrders.map((workOrder, index) => {
        if (!workOrder) {
          return null;
        }
        const orderConfig = orderConfigs.filter(
          (config) => config.name.toLowerCase() === workOrder.action.toLowerCase(),
        )[0];
        return (
          <Fragment key={`workOrderListItem${workOrder.id.toString()}`}>
            <div onContextMenu={handleContextMenu} data-menu={workOrder.id.toString()}>
              <WorkOrderListItem
                id={`workOrderListItem-${driver.id}-${workOrder.id}`}
                driver={driver}
                drivers={drivers}
                force={force}
                workOrder={workOrder}
                workOrders={workOrders}
                orderConfig={orderConfig}
                index={index}
                manageWoPollingInterval={updatePolling}
                unpublishedChanges={unpublishedChanges}
                isListItem={isListItem}
              />
            </div>
            <ContextMenu
              driver={driver}
              waypoints={waypoints}
              workOrder={workOrder}
              menuId={workOrder.id.toString()}
              force={force}
              onShown={onShown}
              onUpdateSingleWorkOrder={onUpdateSingleWorkOrder}
              onUpdateSingleWorkOrderWDriver={onUpdateSingleWorkOrderWDriver}
              onCreateWorkOrder={onCreateWorkOrder}
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
              unpublishedChanges={unpublishedChanges}
              isUpdating={isUpdating}
              history={history}
            />
          </Fragment>
        );
      })}
    </div>
  );
};

DroppableDriverList.propTypes = {
  workOrders: PropTypes.array.isRequired,
  driver: PropTypes.object.isRequired,
  waypoints: PropTypes.array.isRequired,
  force: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool,
  unpublishedChanges: PropTypes.number.isRequired,
  onUpdateSingleWorkOrder: PropTypes.func.isRequired,
  onUpdateSingleWorkOrderWDriver: PropTypes.func.isRequired,
  onCreateWorkOrder: PropTypes.func.isRequired,
  drivers: PropTypes.array,
  manageWoPollingInterval: PropTypes.func.isRequired,
  isListItem: PropTypes.bool,
  history: PropTypes.object.isRequired,
};

export default DroppableDriverList;
