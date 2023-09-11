import { action, computed, observable, reaction } from 'mobx';

import { sortEntities } from '@root/helpers';
import { IEntity } from '@root/types';

import type GlobalStore from '../GlobalStore';

import { BaseStore } from './BaseStore';
import { ConfigurationSortType } from './types';

interface ConfigurationDataEntity extends IEntity {
  active?: boolean;
}

export class ConfigurationDataBaseStore<T extends ConfigurationDataEntity> extends BaseStore<T> {
  protected selectOnCreate = true;
  @observable sortOrders: ConfigurationSortType<T>;

  constructor(global: GlobalStore, sortOrder: ConfigurationSortType<T>) {
    super(global);

    this.sortOrders = sortOrder;

    reaction(
      () => this.globalStore.systemConfigurationStore.isCreating,
      isCreating => {
        if (isCreating && this.selectOnCreate && this.selectedEntity !== null) {
          this.unSelectEntity();
        }
      },
    );
  }

  @computed
  get primarySortOrder() {
    return typeof this.sortOrders[0] === 'object' ? this.sortOrders[0].order : 'asc';
  }

  @computed
  get sortedValues() {
    const baseValues = this.values;

    const showInactive = this.globalStore.systemConfigurationStore.showInactive;

    const data = showInactive ? baseValues : baseValues.filter(baseValue => baseValue.active);

    return sortEntities(data, this.sortOrders, showInactive);
  }

  @computed
  get allSortedValues() {
    return sortEntities(this.values, this.sortOrders, true);
  }

  @action
  selectEntity(entity: T, shouldOpenQuickView = true) {
    if (
      (this.globalStore.systemConfigurationStore.isCreating ||
        this.globalStore.systemConfigurationStore.isDuplicating) &&
      entity
    ) {
      this.globalStore.systemConfigurationStore.toggleCreating(false);
      this.globalStore.systemConfigurationStore.toggleDuplicating(false);
    }
    super.selectEntity(entity, shouldOpenQuickView);
  }

  @action
  setSortOrder(sortOrders: ConfigurationSortType<T>) {
    this.sortOrders = sortOrders;
  }
}
