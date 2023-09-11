import { UPDATE_EVENT_TYPE } from '../consts/updateEvents.js';

export const mapUpdateEvents = items => {
  const add = [];
  const edit = [];
  const remove = [];

  items.forEach(item => {
    switch (item.eventType) {
      case UPDATE_EVENT_TYPE.add: {
        add.push(item);
        break;
      }
      case UPDATE_EVENT_TYPE.edit: {
        edit.push(item);
        break;
      }
      case UPDATE_EVENT_TYPE.remove: {
        remove.push(item);
        break;
      }
      default: {
        break;
      }
    }
  });

  return { add, edit, remove };
};
