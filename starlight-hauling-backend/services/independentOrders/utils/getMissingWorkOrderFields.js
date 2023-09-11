import pick from 'lodash/fp/pick.js';

import { ACTION } from '../../../consts/actions.js';

// Return null if all the required fields are provided,
// otherwise the list of null fields
const getMissingWorkOrderFields = (workOrder, action, disposalSite) => {
  const fields = [
    'driverId',
    'truckId',
    'startWorkOrderDate',
    'arriveOnSiteDate',
    'startServiceDate',
    'finishWorkOrderDate',
  ];

  fields.disposalSite = false;
  switch (ACTION[action]) {
    case ACTION.delivery: {
      fields.push('droppedEquipmentItem');
      break;
    }
    case ACTION.switch: {
      fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem', 'ticket', 'weight');
      fields.disposalSite = true;
      break;
    }
    case ACTION.final: {
      fields.push('pickedUpEquipmentItem', 'ticket', 'weight');
      fields.disposalSite = true;
      break;
    }
    case ACTION.dumpReturn: {
      fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem', 'ticket', 'weight');
      fields.disposalSite = true;
      break;
    }
    case ACTION.liveLoad: {
      fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem', 'ticket', 'weight');
      fields.disposalSite = true;
      break;
    }
    case ACTION.reposition:
    case ACTION.relocate: {
      fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem');
      break;
    }
    default: {
      break;
    }
  }

  const allValid = Object.values(pick(workOrder, fields)).every(v => v);

  fields.disposalSite && fields.push('disposalSite');

  if (allValid && (fields.disposalSite ? !!disposalSite : true)) {
    return null;
  }
  return fields;
};

export default getMissingWorkOrderFields;
