// @ts-check

export default class WorkOrderMediaMapper {
  static async mapHaulingWorkOrderMedia({ media, isIndependent, model }) {
    const promises = media.map(async m => {
      const workOrderId = m.subscriptionWorkOrderId || m.independentWorkOrderId;

      const workOrder = await model.getBy({
        condition: { isIndependent, workOrderId },
        fields: ['id'],
      });

      return {
        id: m.id,
        author: m.author,
        fileName: m.fileName,
        workOrderId: workOrder.id,
        timestamp: m.timestamp,
        url: m.url,
      };
    });

    const mappedMedia = await Promise.all(promises);

    return mappedMedia;
  }
}
