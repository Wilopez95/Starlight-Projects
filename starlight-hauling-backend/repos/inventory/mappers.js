export const mapEquipmentsToInventoryItems = (businessUnitId, equipmentItems) =>
  equipmentItems.map(({ id, ...restItem }) => ({
    businessUnitId,
    equipmentItemId: id,
    ...restItem,
  }));
