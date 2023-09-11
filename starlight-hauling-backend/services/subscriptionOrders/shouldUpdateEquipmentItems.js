export const shouldUpdateEquipmentItems = (data, oldOrder) =>
  data.droppedEquipmentItem !== oldOrder.droppedEquipmentItem ||
  data.pickedUpEquipmentItem !== oldOrder.pickedUpEquipmentItem;
