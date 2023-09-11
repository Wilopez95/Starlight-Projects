export const changesAreCritical = (originalData, newData) =>
  newData.billableServiceId !== originalData.billableServiceOriginalId ||
  newData.materialId !== originalData.materialOriginalId ||
  String(newData.quantity) !== String(originalData.quantity);
