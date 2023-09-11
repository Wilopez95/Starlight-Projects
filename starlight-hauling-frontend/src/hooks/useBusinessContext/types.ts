import { BusinessLineType } from '@root/consts';
import { IBusinessContextIds } from '@root/types';

export type BusinessParams = {
  businessUnit: string;
  businessLine: string;
};

export interface IUseBusinessContextResponse extends IBusinessContextIds {
  businessLineType?: BusinessLineType;
}
