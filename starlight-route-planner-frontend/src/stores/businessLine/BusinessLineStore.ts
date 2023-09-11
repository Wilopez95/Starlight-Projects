import sortBy from 'lodash-es/sortBy';
import { computed } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { BusinessLineType } from '@root/consts';
import { IBusinessLine } from '@root/types';

import { BusinessLineService } from '../../api';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { BusinessLine } from './BusinessLine';

export class BusinessLineStore extends BaseStore<IBusinessLine> {
  private readonly service: BusinessLineService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new BusinessLineService();
  }

  @computed
  get currentBusinessLines() {
    const currentBU = this.globalStore.businessUnitStore.selectedEntity;

    if (!currentBU) {
      return [];
    }

    const sortedBusinessLines = sortBy(currentBU.businessLines, ({ id }) => id);

    return sortedBusinessLines.filter(({ type }) => type !== BusinessLineType.rollOff);
  }

  @computed
  get getDropdownOptions() {
    return this.currentBusinessLines.map(({ name, id }) => ({
      label: name,
      value: id,
    }));
  }

  getById(paramId: string | number | null | undefined): IBusinessLine | null {
    if (paramId === null) {
      return null;
    }
    const id = Number(paramId);

    return this.currentBusinessLines.find(lob => lob.id === id) ?? null;
  }

  // currently not in use, but can be helpful at some point
  @actionAsync
  async getHaulingBusinessLines() {
    this.loading = true;
    try {
      const { haulingBusinessLines } = await task(this.service.getHaulingBusinessLines());

      this.setItems(haulingBusinessLines.map(unit => new BusinessLine(this, unit)));
    } catch (error) {
      console.error('BusinessUnit Request Error:', error);
    } finally {
      this.loading = false;
    }
  }

  @computed
  get getNormalizedFilters() {
    return this.values.filter(businessLine => businessLine.type !== BusinessLineType.rollOff);
  }
}
