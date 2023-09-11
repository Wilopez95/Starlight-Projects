export const mapServiceItemsForRegeneration = serviceItems =>
  serviceItems.map(({ subscription, ...item }) => ({
    ...item,
    billableServiceId: item.billableServiceOriginalId,
    materialId: item.materialOriginalId,
  }));
