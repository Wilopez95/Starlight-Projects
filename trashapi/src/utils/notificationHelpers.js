/* eslint-disable complexity */

export const needsPushNotification = (order, seed) => {
  if (seed.driverId && order.driverId !== seed.driverId) {
    return true;
  }

  if (seed.size && order.size !== seed.size) {
    return true;
  }

  if (seed.material && order.material !== seed.material) {
    return true;
  }

  if (seed.permitNumber && order.permitNumber !== seed.permitNumber) {
    return true;
  }

  if (seed.instructions && order.instructions !== seed.instructions) {
    return true;
  }

  if (seed.scheduledDate && order.scheduledDate !== seed.scheduledDate) {
    return true;
  }

  if (seed.action && order.action !== seed.action) {
    return true;
  }

  if (
    seed.location1 &&
    seed.location1.name &&
    order.location1 &&
    order.location1.name !== seed.location1.name
  ) {
    return true;
  }

  if (
    seed.location2 &&
    seed.location2.name &&
    order.location2 &&
    order.location2.name !== seed.location2.name
  ) {
    return true;
  }

  return false;
};

export const getPushNotificationMessageEnglish = (order, seed) => {
  let message = '';
  let fieldsChanged = 0;

  if (seed.driverId && order.driverId !== seed.driverId) {
    message += 'driver, ';
    fieldsChanged++;
  }

  if (seed.size && order.size !== seed.size) {
    message += 'size, ';
    fieldsChanged++;
  }

  if (seed.material && order.material !== seed.material) {
    message += 'material, ';
    fieldsChanged++;
  }

  if (seed.permitNumber && order.permitNumber !== seed.permitNumber) {
    message += 'permit number, ';
    fieldsChanged++;
  }

  if (seed.instructions && order.instructions !== seed.instructions) {
    message += 'instructions, ';
    fieldsChanged++;
  }

  if (seed.scheduledDate && order.scheduledDate !== seed.scheduledDate) {
    message += 'scheduled date, ';
    fieldsChanged++;
  }

  if (seed.action && order.action !== seed.action) {
    message += 'type, ';
    fieldsChanged++;
  }

  if (
    seed.location1 &&
    seed.location1.name &&
    order.location1 &&
    order.location1.name !== seed.location1.name
  ) {
    message += 'location1, ';
    fieldsChanged++;
  }

  if (
    seed.location2 &&
    seed.location2.name &&
    order.location2 &&
    order.location2.name !== seed.location2.name
  ) {
    message += 'location2, ';
    fieldsChanged++;
  }

  message = message.slice(0, message.length - 2);
  message = message.charAt(0).toUpperCase() + message.slice(1);

  if (fieldsChanged > 1) {
    message += ' have been modified';
  } else {
    message += ' has been modified';
  }

  return message;
};

export const getPushNotificationMessageSpanish = (order, seed) => {
  let message = '';
  let fieldsChanged = 0;

  if (seed.driverId && order.driverId !== seed.driverId) {
    message += 'conductor, ';
    fieldsChanged++;
  }

  if (seed.size && order.size !== seed.size) {
    message += 'la talla, ';
    fieldsChanged++;
  }

  if (seed.material && order.material !== seed.material) {
    message += 'el material, ';
    fieldsChanged++;
  }

  if (seed.permitNumber && order.permitNumber !== seed.permitNumber) {
    message += 'numero de permiso, ';
    fieldsChanged++;
  }

  if (seed.instructions && order.instructions !== seed.instructions) {
    message += 'instrucciones, ';
    fieldsChanged++;
  }

  if (seed.scheduledDate && order.scheduledDate !== seed.scheduledDate) {
    message += 'cita agendada, ';
    fieldsChanged++;
  }

  if (seed.action && order.action !== seed.action) {
    message += 'tipo, ';
    fieldsChanged++;
  }

  if (
    seed.location1 &&
    seed.location1.name &&
    order.location1 &&
    order.location1.name !== seed.location1.name
  ) {
    message += 'ubicación1, ';
    fieldsChanged++;
  }

  if (
    seed.location2 &&
    seed.location2.name &&
    order.location2 &&
    order.location2.name !== seed.location2.name
  ) {
    message += 'ubicación2, ';
    fieldsChanged++;
  }

  message = message.slice(0, message.length - 2);
  message = message.charAt(0).toUpperCase() + message.slice(1);

  if (fieldsChanged > 1) {
    message += ' han sido modificados';
  } else {
    message += ' ha sido modificado';
  }

  return message;
};
