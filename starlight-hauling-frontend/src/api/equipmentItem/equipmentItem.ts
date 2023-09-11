import { EquipmentItemWithImage, IEquipmentItem } from '@root/types';
import { type RequestQueryParams, BaseService, haulingHttpClient } from '../base';

export class EquipmentItemService extends BaseService<IEquipmentItem> {
  constructor() {
    super('equipment-items');
  }

  createEquipmentItemWithImage(
    newEntity: EquipmentItemWithImage,
    options: RequestQueryParams = {},
  ) {
    const { image, ...equipmentItem } = newEntity;

    if (image) {
      return haulingHttpClient.sendForm<EquipmentItemWithImage, IEquipmentItem>({
        url: `${this.baseUrl}`,
        data: newEntity,
        method: 'POST',
        queryParams: options,
      });
    }

    return haulingHttpClient.post(this.baseUrl, equipmentItem, options);
  }

  getEquipmentItemHistocal(equipmentItemId: number | undefined) {
    return haulingHttpClient.get<IEquipmentItem[]>(`${this.baseUrl}/historical/${equipmentItemId}`);
  }

  updateEquipmentItemWithImage(
    id: number,
    newEntity: EquipmentItemWithImage,
    options: RequestQueryParams = {},
  ) {
    const { image, ...equipmentItem } = newEntity;

    if (image) {
      return haulingHttpClient.sendForm<EquipmentItemWithImage, IEquipmentItem>({
        url: `${this.baseUrl}/${id}`,
        data: newEntity,
        method: 'PUT',
        queryParams: options,
      });
    }
    const concurrentData = { [id]: equipmentItem.updatedAt };

    return haulingHttpClient.put({
      url: `${this.baseUrl}/${id}`,
      data: equipmentItem,
      queryParams: options,
      concurrentData,
    });
  }
}
