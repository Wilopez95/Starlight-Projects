import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { IEquipmentItem } from '@root/types';

import { EquipmentItemService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { EquipmentItem } from './EquipmentItem';

export class EquipmentItemStore extends BaseStore<IEquipmentItem> {
  private readonly service: EquipmentItemService;

  @observable currentEquipmentItem: IEquipmentItem | null;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new EquipmentItemService();
    this.currentEquipmentItem = null;
  }

  @action
  setCurrentEquipment(equipment: IEquipmentItem | null) {
    this.currentEquipmentItem = equipment;
  }

  @actionAsync
  async getHaulingEquipmentItems(businessLineId: number) {
    this.loading = true;

    try {
      const { haulingEquipmentItems } = await task(
        this.service.getHaulingEquipmentItems(businessLineId),
      );

      this.setItems(
        haulingEquipmentItems.map(equipmentItem => new EquipmentItem(this, equipmentItem)),
      );
    } catch (error) {
      console.error('Equipment Item Request Error:', error);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async fetchById(businessLineId: number, equipmentId: number) {
    this.loading = true;

    try {
      const { haulingEquipmentItems } = await task(
        this.service.getHaulingEquipmentItems(businessLineId),
      );

      const equipmentItem = haulingEquipmentItems.find(equipment => equipment.id === equipmentId);

      if (equipmentItem) {
        this.setCurrentEquipment(new EquipmentItem(this, equipmentItem));
      }
    } catch (error) {
      console.error('Equipment Item Request By Id Error', error);
    } finally {
      this.loading = false;
    }
  }

  @computed
  get getDropdownOptions() {
    return this.values.map(({ description, id }) => ({
      label: description,
      value: id,
    }));
  }
}
