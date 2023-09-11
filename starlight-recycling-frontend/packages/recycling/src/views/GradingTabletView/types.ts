import { GetGradingOrderQuery } from '../../graphql/api';

export type GradingOrder = GetGradingOrderQuery['order'] & { total?: number };

export type Materials = GradingOrder['materialsDistribution'];

export interface GradingControlFieldProps {
  name: string;
}
