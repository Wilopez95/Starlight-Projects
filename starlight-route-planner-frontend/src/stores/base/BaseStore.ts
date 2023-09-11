import { orderBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';

import { ApiError } from '@root/api/base/ApiError';
import { baseSort } from '@root/helpers';
import { SortType } from '@root/types';

import type GlobalStore from '../GlobalStore';

import { BaseEntity } from './BaseEntity';

export abstract class BaseStore<T extends BaseEntity> {
  globalStore: GlobalStore;
  @observable private data = new Map<number, T>();

  @observable selectedEntity: T | null = null;
  @observable loading = false;
  @observable quickViewLoading = false;
  @observable loaded = false;
  @observable isOpenQuickView = false;
  @observable isPreconditionFailed = false;

  protected offset = 0;
  protected limit = 25;

  constructor(globalStore: GlobalStore) {
    this.globalStore = globalStore;
  }

  getById(paramId: string | number | null | undefined): T | null {
    if (paramId === null) {
      return null;
    }
    const id = Number(paramId);

    return this.data.get(id) ?? null;
  }

  @action
  setItem(entity: T) {
    this.data.set(+entity.id, entity);
  }

  @action
  setItems(entities: T[]) {
    entities.forEach(entry => {
      this.data.set(+entry.id, entry);
    });
  }

  @action
  selectEntity(entity: T, shouldOpenQuickView = true) {
    this.selectedEntity = entity;
    if (shouldOpenQuickView) {
      this.toggleQuickView(true);
    }
  }

  // TODO: fix updateEntity id type
  @action
  updateSelectedEntity(newEntity: T) {
    if (!this.selectedEntity || Number(newEntity.id) === Number(this.selectedEntity.id)) {
      this.selectEntity(newEntity, false);
    }
  }

  @action.bound
  unSelectEntity(callback?: () => void) {
    this.selectedEntity = null;
    callback?.();
  }

  @action
  removeEntity(id: number) {
    this.data.delete(+id);
  }

  @action
  cleanup() {
    this.loading = false;
    this.quickViewLoading = false;
    this.loaded = false;
    this.offset = 0;
    this.data.clear();
    this.isPreconditionFailed = false;
    this.isOpenQuickView = false;
  }

  @action
  clearPreconditionFailedError() {
    this.isPreconditionFailed = false;
  }

  @action
  toggleQuickView(value?: boolean): void {
    this.isOpenQuickView = value === undefined ? !this.isOpenQuickView : value;
  }

  @action
  toggleQuickViewLoading(value?: boolean): void {
    this.quickViewLoading = value === undefined ? !this.quickViewLoading : value;
  }

  @action
  validatePreconditionError(error: ApiError) {
    this.isPreconditionFailed = error.isPreconditionFailed;
  }

  @computed
  get values(): T[] {
    return Array.from(this.data.values());
  }

  protected sortValues(sortBy: keyof T, sortOrder: SortType, values: T[] = this.values) {
    return orderBy(values, value => baseSort(value[sortBy]), sortOrder);
  }

  @action
  protected validateLoading(responseData: unknown[] = [], limit: number) {
    if (responseData.length === 0 || responseData.length !== limit) {
      this.loaded = true;
    }
  }

  @computed
  get noResult() {
    return this.loaded && this.values.length === 0;
  }
}
