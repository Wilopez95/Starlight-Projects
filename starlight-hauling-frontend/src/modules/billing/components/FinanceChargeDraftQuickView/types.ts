import { ICustomQuickView } from '@root/common';

export interface IFinanceChargeDraftQuickView extends ICustomQuickView {
  statementIds: number[];
}
