import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { IHaulingMaterialFilters } from '@root/api/material/types';
import { IMaterial } from '@root/types';

import { MaterialService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { Material } from './Material';

export class MaterialStore extends BaseStore<IMaterial> {
  private readonly service: MaterialService;

  @observable currentMaterialItem: IMaterial | null;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new MaterialService();
    this.currentMaterialItem = null;
  }

  @action
  setCurrentMaterial(material: IMaterial | null) {
    this.currentMaterialItem = material;
  }

  @actionAsync
  async getHaulingMaterials(haulingMaterialFilters: IHaulingMaterialFilters) {
    this.loading = true;

    try {
      const { haulingMaterials } = await task(
        this.service.getHaulingMaterials(haulingMaterialFilters),
      );

      this.setItems(haulingMaterials.map(material => new Material(this, material)));
    } catch (error) {
      console.error('Material Request Error', error);
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async fetchById(materialId: number) {
    this.loading = true;

    try {
      const { haulingMaterials } = await task(
        this.service.getHaulingMaterials({
          materialIds: [materialId],
        }),
      );

      const materials = haulingMaterials.map(material => new Material(this, material));

      if (materials[0]) {
        this.setCurrentMaterial(materials[0]);
      }
    } catch (error) {
      console.error('Material Request By Id Error', error);
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
